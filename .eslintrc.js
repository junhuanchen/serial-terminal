/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
  root: true,

  extends: [
    'plugin:vue/essential',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript',
    // "google"
  ],

  plugins: [
    '@typescript-eslint',
  ],

  env: {
    browser : true,
    node    : true,
    builtin : true,
    es6     : true,
  },

  parser: 'vue-eslint-parser',

  parserOptions: {
    extraFileExtensions : ['.vue'],
    parser              : '@typescript-eslint/parser',
    project             : './tsconfig.json',
    sourceType          : 'module',
  },

  rules: {
    'indent': ['off', 4], // https://blog.csdn.net/qq_35132089/article/details/105887879
    "@typescript-eslint/no-explicit-any": "off",
    "vue/no-multiple-template-root": "off",
    'vue/valid-v-model': 'off',
    "vue/no-v-model-argument": "off",
    "max-len": ["error", { "code": 256 }],
    "@typescript-eslint/ban-types": [
      "error",
      {
        "extendDefaults": true,
        "types": {
          "{}": false
        }
      }
    ],
  },
}