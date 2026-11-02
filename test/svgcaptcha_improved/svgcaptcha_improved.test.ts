import test from 'node:test';
import assert from 'node:assert';

import { SVGCaptchaImproved } from '@src/index';
import opentype from 'opentype.js';
import path from 'path';
import fs_promises from 'fs/promises';
import os from 'node:os';

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% Test Definitions %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

test('SVG Captcha Test.', async function (t) {
  const output_root = await fs_promises.mkdtemp(path.join(os.tmpdir(), 'svgcaptcha-test-'));
  t.after(() => fs_promises.rm(output_root, { recursive: true, force: true }));
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
            reenforce_text_outline_count: 15
          },
          noise: {
            curved_line_count: 4,
            zigzag_line_count: 4,
            character_noise_multiplier: 4,
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

  for (let idx = 0; idx < 20; idx++) {
    const created_svg = await svgcaptchai.create();
    assert.ok(created_svg, `No svg created. #${idx}`);
    assert.ok(created_svg?.data, `No data element. #${idx}`);
    assert.ok(created_svg?.text, `No text element.  #${idx}`);

    const output_file_path = path.resolve(
      path.join(output_root, `test_output_${idx}.svg`)
    );

    await fs_promises.writeFile(output_file_path, created_svg?.data);

    // record set should be empty array now
    assert.ok(
      (await fs_promises.stat(output_file_path)).isFile(),
      `Svg file #${idx} was not written to disk.`
    );

    console.log(`${idx}. ${created_svg?.text}`);
  }
});
