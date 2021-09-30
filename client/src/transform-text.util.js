export const transformText = (text) => {
  if (text.toLowerCase().includes("sale")) {
    return `${text}!`;
  } else if (text.toLowerCase().includes("new")) {
    return `${text}~~`;
  } else if (text.toLowerCase().includes("limited edition")) {
    return text.toUpperCase();
  } else {
    return text;
  }
};
