module.exports = {
    "root": true,
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "ignorePatterns": ["build/*", "node_modules/*"],
    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "no-prototype-builtins": "off",
        "@typescript-eslint/no-empty-function": "off"
    }
}
