/**
 * ESLint Rule: Contrast Validation
 *
 * Prevents dangerous color combinations in JSX className attributes
 * that could result in unreadable text (white-on-white, black-on-black, etc.)
 */

const DANGEROUS_COMBINATIONS = [
  // White text on light backgrounds
  {
    bg: /bg-white|bg-neutral-50|bg-neutral-100/,
    text: /text-white|text-neutral-50|text-neutral-100/,
  },

  // Dark text on dark backgrounds
  {
    bg: /bg-neutral-800|bg-neutral-900|bg-black/,
    text: /text-neutral-800|text-neutral-900|text-black/,
  },

  // Light colors on light backgrounds
  {
    bg: /bg-yellow-[123]00|bg-orange-[123]00/,
    text: /text-white|text-yellow-[123]00/,
  },

  // Primary/secondary variations that might be problematic
  { bg: /bg-primary-[123]00/, text: /text-primary-[123]00|text-white/ },
  { bg: /bg-secondary-[123]00/, text: /text-secondary-[123]00|text-white/ },
];

const SAFE_COMBINATIONS = {
  "bg-white": [
    "text-neutral-700",
    "text-neutral-800",
    "text-neutral-900",
    "text-primary-700",
    "text-primary-800",
    "text-primary-900",
  ],
  "bg-neutral-50": [
    "text-neutral-700",
    "text-neutral-800",
    "text-neutral-900",
    "text-primary-700",
    "text-primary-800",
    "text-primary-900",
  ],
  "bg-neutral-100": [
    "text-neutral-700",
    "text-neutral-800",
    "text-neutral-900",
    "text-primary-700",
    "text-primary-800",
    "text-primary-900",
  ],
  "bg-neutral-800": ["text-white", "text-neutral-50", "text-neutral-100"],
  "bg-neutral-900": ["text-white", "text-neutral-50", "text-neutral-100"],
  "bg-primary-500": ["text-white", "text-neutral-50"],
  "bg-primary-600": ["text-white", "text-neutral-50"],
  "bg-secondary-500": ["text-white", "text-neutral-50"],
  "bg-secondary-600": ["text-white", "text-neutral-50"],
};

function extractClasses(value) {
  if (typeof value !== "string") return [];

  // Handle template literals and concatenation
  const cleanValue = value.replace(/[`'"]/g, "").replace(/\$\{[^}]*\}/g, "");
  return cleanValue.split(/\s+/).filter((cls) => cls.length > 0);
}

function findDangerousCombination(classes) {
  const bgClasses = classes.filter((cls) => cls.startsWith("bg-"));
  const textClasses = classes.filter((cls) => cls.startsWith("text-"));

  for (const bgClass of bgClasses) {
    for (const textClass of textClasses) {
      // Check against dangerous combinations
      for (const combo of DANGEROUS_COMBINATIONS) {
        if (combo.bg.test(bgClass) && combo.text.test(textClass)) {
          return {
            dangerous: true,
            bg: bgClass,
            text: textClass,
            suggestion: SAFE_COMBINATIONS[bgClass] || [],
          };
        }
      }

      // Check for exact same color values (most dangerous)
      const bgColor = bgClass.replace("bg-", "");
      const textColor = textClass.replace("text-", "");

      if (bgColor === textColor) {
        return {
          dangerous: true,
          bg: bgClass,
          text: textClass,
          exact: true,
          suggestion: SAFE_COMBINATIONS[bgClass] || [],
        };
      }
    }
  }

  return { dangerous: false };
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent dangerous color combinations that result in unreadable text",
      category: "Accessibility",
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          strict: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const strict = options.strict !== false;

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;

        let classValue = "";

        if (node.value) {
          if (node.value.type === "Literal") {
            classValue = node.value.value;
          } else if (node.value.type === "JSXExpressionContainer") {
            const expr = node.value.expression;

            if (expr.type === "Literal") {
              classValue = expr.value;
            } else if (expr.type === "TemplateLiteral") {
              // Handle template literals - extract static parts
              classValue = expr.quasis
                .map((quasi) => quasi.value.cooked)
                .join(" ");
            } else if (
              expr.type === "CallExpression" &&
              expr.callee.name === "cn"
            ) {
              // Handle cn() utility function calls - check arguments
              expr.arguments.forEach((arg) => {
                if (arg.type === "Literal") {
                  classValue += " " + arg.value;
                }
              });
            }
          }
        }

        if (!classValue) return;

        const classes = extractClasses(classValue);
        const result = findDangerousCombination(classes);

        if (result.dangerous) {
          let message = "";

          if (result.exact) {
            message = `Dangerous contrast: ${result.bg} with ${result.text} will be completely unreadable`;
          } else {
            message = `Poor contrast: ${result.bg} with ${result.text} may be difficult to read`;
          }

          if (result.suggestion.length > 0) {
            message += `. Consider: ${result.suggestion.slice(0, 3).join(", ")}`;
          }

          context.report({
            node: node.value || node,
            message,
          });
        }
      },
    };
  },
};
