// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { accessibilityTree, computeName, implicitRole } from '../../src/lib/accname.ts';

const html = (markup: string): HTMLElement => {
  document.body.innerHTML = markup;
  return document.body;
};

describe('implicit roles', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  it('maps HTML semantics to roles', () => {
    const body = html(
      '<nav></nav><a href="#">x</a><a>y</a><button></button><h2>t</h2><img alt="">',
    );
    const roles = [...body.children].map(implicitRole);
    expect(roles).toEqual(['navigation', 'link', 'generic', 'button', 'heading', 'presentation']);
  });
  it('only makes header a banner outside sectioning content', () => {
    const body = html('<header id="a"></header><article><header id="b"></header></article>');
    expect(implicitRole(body.querySelector('#a')!)).toBe('banner');
    expect(implicitRole(body.querySelector('#b')!)).toBe('generic');
  });
  it('makes a section a region only when it is named', () => {
    const body = html(
      '<section id="a"><h2>Plain</h2></section><section id="b" aria-label="FAQ"></section>',
    );
    expect(implicitRole(body.querySelector('#a')!)).toBe('generic');
    expect(implicitRole(body.querySelector('#b')!)).toBe('region');
  });
});

describe('accessible name precedence', () => {
  it('aria-labelledby beats aria-label beats content', () => {
    const body = html(
      '<span id="l">From labelledby</span><button aria-labelledby="l" aria-label="From label">Content</button>',
    );
    expect(computeName(body.querySelector('button')!)).toEqual({
      name: 'From labelledby',
      from: 'aria-labelledby',
    });
  });
  it('resolves aria-labelledby inside a shadow root', () => {
    const host = html('<div></div>').firstElementChild!;
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<section aria-labelledby="faq"><h2 id="faq">FAQ</h2></section>';
    const section = shadow.querySelector('section')!;
    expect(computeName(section).name).toBe('FAQ');
    expect(implicitRole(section)).toBe('region');
  });
  it('uses the associated <label> for inputs', () => {
    const body = html('<label for="e">Email address</label><input id="e">');
    expect(computeName(body.querySelector('input')!).name).toBe('Email address');
  });
  it('uses alt text inside a link, and gives icon-only buttons no name', () => {
    const body = html(
      '<a href="#"><img src="x" alt="Home"></a><button><svg aria-hidden="true"></svg></button>',
    );
    expect(computeName(body.querySelector('a')!).name).toBe('Home');
    expect(computeName(body.querySelector('button')!).name).toBe('');
  });
  it('names fieldsets, figures and tables from their captions', () => {
    const body = html(
      '<fieldset><legend>Shipping</legend></fieldset><figure><figcaption>Chart</figcaption></figure><table><caption>Prices</caption></table>',
    );
    expect([...body.children].map((el) => computeName(el).name)).toEqual([
      'Shipping',
      'Chart',
      'Prices',
    ]);
  });
  it('falls back to placeholder only as a last resort', () => {
    const body = html('<input placeholder="Search">');
    expect(computeName(body.querySelector('input')!).from).toMatch(/placeholder/);
  });
});

describe('accessibility tree', () => {
  it('skips hidden and generic nodes', () => {
    const body = html(
      '<div><h1>Title</h1><p hidden>gone</p><div aria-hidden="true"><button>x</button></div><ul><li>a</li></ul></div>',
    );
    expect(accessibilityTree(body).map((n) => n.role)).toEqual(['heading', 'list', 'listitem']);
  });
});
