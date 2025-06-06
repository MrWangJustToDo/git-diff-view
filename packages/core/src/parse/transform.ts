let enableTransform = false;

const temp = (f: string) => f;

let preTransform = temp;

let afterTransform = temp;


/**
 * ⚠️ **WARNING: DANGEROUS OPERATION** ⚠️
 * 
 * Sets a pre-transformation function that will be applied to content before processing.
 * This is a global state modification that affects all subsequent operations.
 * 
 * **CAUTION**: 
 * - This function modifies global state and may cause unexpected side effects
 * - The transformation will be applied to ALL content processing operations
 * - Multiple calls will overwrite the previous transform function
 * - Ensure proper error handling in your transform function to avoid breaking the entire pipeline
 * 
 * @param fn - The transformation function to apply before processing content
 * @throws {Error} Throws an error if the provided parameter is not a function
 * 
 * @example
 * ```typescript
 * // Use with caution - this affects global behavior
 * setPreTransform((content) => content.trim());
 * ```
 */
export const setPreTransform = (fn: (content: string) => string) => {
  if (typeof fn !== "function") {
    throw new Error("Transform must be a function");
  }
  
  preTransform = fn;

  enableTransform = true;
};

/**
 * ⚠️ **WARNING: DANGEROUS OPERATION** ⚠️
 * 
 * Sets an after-transformation function that will be applied to content after processing.
 * This is a global state modification that affects all subsequent operations.
 * 
 * **CAUTION**: 
 * - This function modifies global state and may cause unexpected side effects
 * - The transformation will be applied to ALL content processing operations
 * - Multiple calls will overwrite the previous transform function
 * - Ensure proper error handling in your transform function to avoid breaking the entire pipeline
 * 
 * @param fn - The transformation function to apply after processing content
 * @throws {Error} Throws an error if the provided parameter is not a function
 * 
 * @example
 * ```typescript
 * // Use with caution - this affects global behavior
 * setAfterTransform((content) => content.replace(/\r\n/g, '\n'));
 * ```
 */
export const setAfterTransform = (fn: (content: string) => string) => {
  if (typeof fn !== "function") {
    throw new Error("Transform must be a function");
  }
  
  afterTransform = fn;

  enableTransform = true;
}

/**
 * Resets all transformation functions to their default state and disables transformation.
 * This clears any previously set pre-transform and after-transform functions.
 * 
 * @example
 * ```typescript
 * resetTransform(); // Clears all transformations
 * ```
 */
export const resetTransform = () => {
  enableTransform = false;

  preTransform = temp;

  afterTransform = temp;
};

/**
 * Checks whether content transformation is currently enabled.
 * 
 * @returns {boolean} True if transformation is enabled, false otherwise
 * 
 * @example
 * ```typescript
 * if (isTransformEnabled()) {
 *   console.log('Transformations are active');
 * }
 * ```
 */
export const isTransformEnabled = () => enableTransform;

/**
 * Applies the pre-transformation function to the provided content if transformation is enabled.
 * 
 * @param content - The content string to transform
 * @returns {string} The transformed content if transformation is enabled and configured, otherwise the original content
 * 
 * @example
 * ```typescript
 * const transformed = doPreTransform('  hello world  ');
 * ```
 */
export const doPreTransform = (content: string) => {
  if (enableTransform && temp !== preTransform) {
    return preTransform(content);
  }
  return content;
}

/**
 * Applies the after-transformation function to the provided content if transformation is enabled.
 * 
 * @param content - The content string to transform
 * @returns {string} The transformed content if transformation is enabled and configured, otherwise the original content
 * 
 * @example
 * ```typescript
 * const transformed = doAfterTransform('hello\r\nworld');
 * ```
 */
export const doAfterTransform = (content: string) => {
  if (enableTransform && temp !== afterTransform) {
    return afterTransform(content);
  }
  return content;
}
