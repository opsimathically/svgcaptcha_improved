// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%% SVGCaptcha Class %%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// IMPORTANT: This is a re-imagined/revised version of the npm svg-captcha package.

import type { Font, PathCommand } from 'opentype.js';

export type svgcaptcha_fonts_config_entry_t = {
  loaded_font: Font;
  config: svgcaptcha_config_options_t;
};

export type svgcaptcha_config_options_t = {
  captcha: {
    character_length: number;
    characters_to_use: string /*"ACDEFHLMPQRSTWXVZ"*/;
  };
  output: {
    width: number;
    height: number;
    font_size: number;
    reenforce_text_outline_count?: number;
  };
  noise: {
    curved_line_count: number;
    zigzag_line_count: number;
    character_noise_multiplier: number;
    arbitrary_code_point_remove_count: number;
  };
  colors: {
    background_color_hex: string /* #ffffff */;
    stroke_color_hex: string /* #000000 */;
  };
};

export type svgcaptcha_run_options_t = svgcaptcha_config_options_t & {
  font: Font;
  ascender: number;
  descender: number;
  x?: number;
  y?: number;
};

export type svgcaptcha_path_command_data_t = PathCommand & {
  x: number;
  y: number;
  x1: number;
  y1: number;
};

export type svgcaptcha_t = {
  text: string;
  data: string;
};

export class SVGCaptchaImproved {
  private fonts: Record<string, svgcaptcha_fonts_config_entry_t>;

  constructor(params: {
    fonts: Record<string, svgcaptcha_fonts_config_entry_t>;
  }) {
    // set loaded fonts and options
    this.fonts = params.fonts;
  }

  /**
   *
   * @description Create a new captcha, returning the solution to the captcha in the text member, and the svg data in the data member.
   */
  public async create(): Promise<svgcaptcha_t | null> {
    // set self reference
    const svgc_ref = this;

    // select a random font
    const font_keys = Object.keys(svgc_ref.fonts);
    if (font_keys.length <= 0) {
      throw new Error('Error, no fonts are loaded.');
      return null;
    }

    // gather font data
    const selected_font_index = svgc_ref.randomInt(0, font_keys.length - 1);
    const selected_font_key = font_keys[selected_font_index];
    const selected_font_data = svgc_ref.fonts[selected_font_key];

    // gather selected loaded font
    const selected_loaded_font = selected_font_data.loaded_font;

    // set run options from class options (this is done because of
    // how the original svg-captcha package takes in options)
    const run_options: svgcaptcha_run_options_t = Object.assign(
      {},
      selected_font_data.config
    ) as svgcaptcha_run_options_t;

    // set ascender and descender
    run_options.font = selected_loaded_font;
    run_options.ascender = selected_loaded_font.ascender;
    run_options.descender = selected_loaded_font.descender;

    // generate captcha text (this will generate the actual letters used by the captcha which the user must solve)
    const text =
      svgc_ref.generateRandomCaptchaLettersFromCharacterSet(run_options);

    // create the captcha
    const data = svgc_ref.createCaptcha(text, run_options);

    // return the text and data
    return { text, data };
  }

  // create the final svg captcha output
  private createCaptcha(
    text: string,
    options: svgcaptcha_run_options_t
  ): string {
    // set self reference
    const svgc_ref = this;

    // gather options
    const width = options.output.width;
    const height = options.output.height;
    const bg = options.colors.background_color_hex;

    // generate parts
    const wavy_line_noise = svgc_ref.getWavyLineNoise(width, height, options);
    const zigzag_noise = svgc_ref.generateZigZagLines(
      options.noise.zigzag_line_count,
      width,
      height
    );

    // create final data (don't randomize, for some reason if text data comes before
    // other values, things can go wonky, not sure why)

    let final_data: any = [];
    final_data = final_data.concat(wavy_line_noise);
    final_data = final_data.concat(zigzag_noise);

    // iterate to reenforce the borders of drawn text (makes captchas more visible through
    // the noise while not redrawing lines)
    const spaced_text = text.split('').join(' ');
    if (!options.output.reenforce_text_outline_count)
      options.output.reenforce_text_outline_count = 2;
    for (
      let idx = 0;
      idx < options.output.reenforce_text_outline_count;
      idx++
    ) {
      const text_data = svgc_ref.getText(spaced_text, width, height, options);
      final_data = final_data.concat(text_data);
    }

    // join data
    final_data = final_data.join(' ');

    // generate the final svg xml output
    const final_xml =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0,0,${width},${height}">` +
      `<rect width="100%" height="100%" fill="${bg}"/>` +
      `<path d="${final_data}" stroke="${options.colors.stroke_color_hex}" fill="none"></path>` +
      `</svg>`;

    // return the final xml
    return final_xml;
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Main Utilities %%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // this will generate a set of zigzag lines
  private generateZigZagLines(
    num_lines: number,
    svg_width: number,
    svg_height: number
  ): Array<string> {
    // set self reference
    const svgc_ref = this;

    // this will hold the codepoints for a zigzag line
    const zig_zag_line_array: Array<string> = [];

    // iterate through the line count
    for (let i = 0; i < num_lines; i++) {
      // Adjust the number of zig-zag points as needed
      for (let j = 0; j < 10; j++) {
        // set x coord
        const newX = (svg_width / 10) * (j + 1);

        // set y coord (random)
        const newY = svgc_ref.randomInt(0, svg_height);

        // store the codepoint
        zig_zag_line_array.push(`L${newX} ${newY}`);
      }
    }

    // return the zigzag line array
    return zig_zag_line_array;
  }

  // create some wavy lines
  private getWavyLineNoise(
    width: number,
    height: number,
    options: svgcaptcha_run_options_t
  ): Array<string> {
    // set self reference
    const svgc_ref = this;

    // this will hold the curved line noise array
    const line_noise_array: Array<string> = [];

    // iterate till we hit the line cap
    for (let i = 0; i < options.noise.curved_line_count; i++) {
      // get line draw points
      const start = `${svgc_ref.randomInt(1, 21)} ${svgc_ref.randomInt(1, height - 1)}`;
      const end = `${svgc_ref.randomInt(width - 21, width - 1)} ${svgc_ref.randomInt(1, height - 1)}`;
      const mid1 = `${svgc_ref.randomInt(width / 2 - 21, width / 2 + 21)} ${svgc_ref.randomInt(1, height - 1)}`;
      const mid2 = `${svgc_ref.randomInt(width / 2 - 21, width / 2 + 21)} ${svgc_ref.randomInt(1, height - 1)}`;

      // store code points
      line_noise_array.push(`M${start}C${mid1},${mid2},${end}`);
    }

    // return the joined line noise array
    return line_noise_array;
  }

  // attempt to retrieve text codepoints
  private getText(
    text: string,
    width: number,
    height: number,
    options: svgcaptcha_run_options_t
  ) {
    // set self reference
    const svgc_ref = this;

    // character spacing
    const spacing = (width - 2) / (text.length + 1);

    // this will hold our codepoint array
    let char_codepoint_array: any = [];

    // iterate through selected random letters and convert them to svg paths
    for (let i = 0; i < text.length; i++) {
      // gather x offset based on spacing
      const x = spacing * (i + 1);

      // gather y position via height
      const y = height / 2;

      const ch_to_path_options: svgcaptcha_run_options_t = Object.assign(
        { x: x, y: y },
        options
      );
      // retrieve character path data
      const path_data = svgc_ref.characterToPath(text[i], ch_to_path_options);

      // add codepoints to array
      char_codepoint_array = char_codepoint_array.concat(path_data);
    }

    // return the array
    return char_codepoint_array;
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Random Utilities %%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // return a random true or false value
  private randomTrueFalse(): boolean {
    const svgc_ref = this;
    const rnd = svgc_ref.randomInt(0, 1);
    if (rnd === 0) return false;
    return true;
  }

  // generate a random integer
  private randomInt(min: any, max: any): number {
    return Math.round(min + Math.random() * (max - min));
  }

  // strip undesired characters from a string
  private stripCharsFromString(str: string, chars: string) {
    return str
      .split('')
      .filter((char: string) => chars.indexOf(char) === -1)
      .join('');
  }

  private generateRandomCaptchaLettersFromCharacterSet(
    options: svgcaptcha_run_options_t
  ): string {
    // set self reference
    const svgc_ref = this;

    const size = options.captcha.character_length || 4;

    let i = -1;
    let out = '';

    const chars = options.captcha.characters_to_use;

    const len = chars.length - 1;

    while (++i < size) {
      out += chars[svgc_ref.randomInt(0, len)];
    }

    return out;
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Character Path Utilities %%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  private rndPathCmd(
    cmd: svgcaptcha_path_command_data_t,
    options: svgcaptcha_run_options_t
  ) {
    // generate random noise multipler
    const r = Math.random() * options.noise.character_noise_multiplier - 0.1;

    // add randomness to paths
    switch (cmd.type) {
      case 'M':
      case 'L':
        cmd.x += r;
        cmd.y += r;
        break;

      case 'Q':
      case 'C':
        cmd.x += r;
        cmd.y += r;
        cmd.x1 += r;
        cmd.y1 += r;
        break;

      default:
        break;
    }

    // floor the values to remove decimals (decimal values can be decoded as
    // different than line values)
    cmd.x = Math.floor(cmd.x);
    cmd.y = Math.floor(cmd.y);
    cmd.x1 = Math.floor(cmd.x1);
    cmd.y1 = Math.floor(cmd.y1);

    // return the command data
    return cmd;
  }

  /**
   * @description Converts a single character to a SVG path.
   */
  private characterToPath(
    text: string,
    opts: svgcaptcha_run_options_t
  ): Array<string> {
    // set self reference
    const svgc_ref = this;

    // x and y must be set for this method
    if (typeof opts.x === 'undefined')
      throw new Error('characterToPath had undefined x value.');
    if (typeof opts.y === 'undefined')
      throw new Error('characterToPath had undefined y value.');

    const ch = text[0];

    const fontSize = opts.output.font_size;
    const fontScale = fontSize / opts.font.unitsPerEm;
    const glyph = opts.font.charToGlyph(ch);
    const width = glyph.advanceWidth ? glyph.advanceWidth * fontScale : 0;
    const left = opts.x - width / 2;
    const height = (opts.ascender + opts.descender) * fontScale;
    const top = opts.y + height / 2;
    const path = glyph.getPath(left, top, fontSize);

    // Randomize path commands
    path.commands.forEach(function (cmd: PathCommand) {
      // create initial random path command
      svgc_ref.rndPathCmd(cmd as svgcaptcha_path_command_data_t, opts);

      // add some random path commands based on random true/false (adds noise),
      // this is required because a lot of svg captcha solvers rely on fingerprinting
      // commands.
      if (svgc_ref.randomTrueFalse() === true)
        svgc_ref.rndPathCmd(cmd as svgcaptcha_path_command_data_t, opts);
    });

    // svgcaptcha_path_command_data_t

    // attempt to add some random entries
    const new_path_commands: any = [];
    for (let idx = 0; idx < path.commands.length; idx++) {
      // create new path commands
      const cmd = path.commands[idx];
      new_path_commands.push(cmd);

      // add random entry
      if (svgc_ref.randomTrueFalse() === true) {
        svgc_ref.rndPathCmd(cmd as svgcaptcha_path_command_data_t, opts);
        new_path_commands.push(cmd);
      }
    }

    // generate command text
    const path_data: Array<string> = [];
    for (let idx = 0; idx < new_path_commands.length; idx++) {
      const command_text = svgc_ref.getPathCommandText(new_path_commands[idx]);
      if (command_text == '') continue;
      path_data.push(command_text);
    }

    // remove random code points (this significantly alters captcha signatures)
    for (
      let idx = 0;
      idx < opts.noise.arbitrary_code_point_remove_count;
      idx++
    ) {
      svgc_ref.removeRandomElement(path_data);
    }

    // return the path data
    return path_data;
  }

  // converts path command data for a single character and converts it to svg data
  private getPathCommandText(command: svgcaptcha_path_command_data_t): string {
    const type = command.type;
    let pos_1 = `0`;
    let pos_2 = `0`;
    let pos_3 = `0`;
    let pos_4 = `0`;

    switch (command.type) {
      case 'M':
      case 'L':
        if (Number.isInteger(command.x) === true) pos_1 = `${command.x}`;
        if (Number.isInteger(command.y) === true) pos_2 = `${command.y}`;

        return `${type}${pos_1} ${pos_2}`;

      case 'C':
      case 'Q':
        if (Number.isInteger(command.x1) === true) pos_1 = `${command.x1}`;
        if (Number.isInteger(command.y1) === true) pos_2 = `${command.y1}`;
        if (Number.isInteger(command.x) === true) pos_3 = `${command.x}`;
        if (Number.isInteger(command.y) === true) pos_4 = `${command.y}`;

        return `${type}${pos_1} ${pos_2} ${pos_3} ${pos_4}`;

      case 'Z':
        // return `${type}`
        break;

      default:
        break;
    }

    // return nothing on unparsable
    return ``;
  }

  // Remove random element from an array.  (we use this to remove random characters/points to avoid
  // fingerprinting.)
  private removeRandomElement(arr: Array<any>): boolean {
    if (arr.length <= 0) {
      return false;
    }
    const random_index = Math.floor(Math.random() * arr.length);
    arr.splice(random_index, 1);
    return true;
  }

  // randomize order of elements in an array
  private shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
