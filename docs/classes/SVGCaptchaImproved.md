[**@opsimathically/svgcaptcha_improved**](../README.md)

***

[@opsimathically/svgcaptcha_improved](../README.md) / SVGCaptchaImproved

# Class: SVGCaptchaImproved

Defined in: [SVGCaptchaImproved.class.ts:57](../../src/classes/svgcaptchaimproved/SVGCaptchaImproved.class.ts#L57)

## Constructors

### Constructor

> **new SVGCaptchaImproved**(`params`): `SVGCaptchaImproved`

Defined in: [SVGCaptchaImproved.class.ts:60](../../src/classes/svgcaptchaimproved/SVGCaptchaImproved.class.ts#L60)

#### Parameters

##### params

###### fonts

`Record`\<`string`, [`svgcaptcha_fonts_config_entry_t`](../type-aliases/svgcaptcha_fonts_config_entry_t.md)\>

#### Returns

`SVGCaptchaImproved`

## Methods

### create()

> **create**(): `Promise`\<[`svgcaptcha_t`](../type-aliases/svgcaptcha_t.md) \| `null`\>

Defined in: [SVGCaptchaImproved.class.ts:71](../../src/classes/svgcaptchaimproved/SVGCaptchaImproved.class.ts#L71)

#### Returns

`Promise`\<[`svgcaptcha_t`](../type-aliases/svgcaptcha_t.md) \| `null`\>

#### Description

Create a new captcha, returning the solution to the captcha in the text member, and the svg data in the data member.
