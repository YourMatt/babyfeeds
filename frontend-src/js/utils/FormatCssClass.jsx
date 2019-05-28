/*
    FormatCssClass
 */

// Formats values for className attributes. This will return without modification if a string was provided, or will join
// all elements with a space between if an array is provided.
export default function FormatCssClass (classes) {

    if (typeof classes === "string") return classes;
    else return classes.join(" ");

}
