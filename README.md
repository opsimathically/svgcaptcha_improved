# SVGCaptcha Improved

This package contains my own personal improvements to the svg-captcha package. The issue with the svg-captcha package as of right now, is that it's easily solvable (100% solve) using captcha solvers. When analyzing the existing solvers, they all rely on fingerprinting in order to solve captchas. To alleviate this, I've added a large amount of randomization with regards to path generation so that fingerprinting will no longer work. On top of this, I've added a lot of convienence features, and migrated the code to typescript.

# Usage

```typescript
import opentype from 'opentype.js';
import path from 'path';
import { SVGCaptchaImproved } from '@opsimathically/svgcaptcha_improved';

// define your font/captcha configurations below.  Fonts will be selected at random between what is
// provided here.  You can use one, or many fonts, doesn't matter.  The reason each font has it's own
// configuration, is tha some fonts are wider, smaller, better spaced, etc than others so you'll need
// to make adjustments based on whatever ttf fonts you supply to opentype.
const svgcaptchai = new SVGCaptchaImproved({
  fonts: {
    comic: {
      loaded_font: opentype.loadSync(
        path.resolve('./test/svgcaptcha_improved/test_fonts/Roboto-Black.ttf')
      ),
      config: {
        captcha: {
          character_length: 5,
          characters_to_use: 'ACDEFHLMPQRSTWXVZ'
        },
        output: {
          font_size: 96,
          width: 250,
          height: 100,
          reenforce_text_outline_count: 20
        },
        noise: {
          curved_line_count: 4,
          zigzag_line_count: 4,
          character_noise_multiplier: 3,
          arbitrary_code_point_remove_count: 15
        },
        colors: {
          background_color_hex: '#ffffff',
          stroke_color_hex: '#000000'
        }
      }
    },
    freedom: {
      loaded_font: opentype.loadSync(
        path.resolve('./test/svgcaptcha_improved/test_fonts/Roboto-Black.ttf')
      ),
      config: {
        captcha: {
          character_length: 5,
          characters_to_use: 'ACDEFHLMPQRSTWXVZ'
        },
        output: {
          font_size: 56,
          width: 300,
          height: 100,
          reenforce_text_outline_count: 5
        },
        noise: {
          curved_line_count: 2,
          zigzag_line_count: 2,
          character_noise_multiplier: 1,
          arbitrary_code_point_remove_count: 2
        },
        colors: {
          background_color_hex: '#ffffff',
          stroke_color_hex: '#000000'
        }
      }
    },
    roboto: {
      loaded_font: opentype.loadSync(
        path.resolve('./test/svgcaptcha_improved/test_fonts/Roboto-Black.ttf')
      ),
      config: {
        captcha: {
          character_length: 5,
          characters_to_use: 'ACDEFHLMPQRSTWXVZ'
        },
        output: {
          font_size: 66,
          width: 250,
          height: 100,
          reenforce_text_outline_count: 5
        },
        noise: {
          curved_line_count: 2,
          zigzag_line_count: 2,
          character_noise_multiplier: 5,
          arbitrary_code_point_remove_count: 0
        },
        colors: {
          background_color_hex: '#ffffff',
          stroke_color_hex: '#000000'
        }
      }
    }
  }
});

// create a svg containing a captcha (will select from any of the 3 configured fonts at random)
const created_svg = await svgcaptchai.create();

// created_svg.data: contains your svg xml/tag/path data.  Embed it in a page, or store it as a .svg file.
// created_svg.text: contains your text solution for the captcha.
```

## Local generation examples

All bundled test profiles use the included unmodified Roboto Black font under its existing SIL Open Font License; the adjacent Roboto-OFL.txt contains its copyright and full terms. Supply any separately licensed font through the existing loaded_font configuration. Run npm test to generate twenty local synthetic examples in an automatically cleaned temporary directory. Randomization is implemented; solver resistance is not certified by these tests.

## Install

```bash
npm install @opsimathically/svgcaptcha_improved
```

## Building from source

This package is intended to be run via npm, but if you'd like to build from source,
clone this repo, enter directory, and run `npm install` for dev dependencies, then run
`npm run build`.

## Usage

[See API Reference for documentation](https://github.com/opsimathically/svgcaptcha_improved/tree/main/docs/)

[See unit tests for more direct usage examples](https://github.com/opsimathically/svgcaptcha_improved/blob/main/test/svgcaptcha_improved/svgcaptcha_improved.test.ts)
