export function getStoryLineFromDocucment(document: Document): null | string {
  const storylineElement =
    document.querySelector('span[data-testid="plot-l"') ||
    document.querySelector('span[data-testid="plot-xl"') ||
    document.querySelector('span[data-testid="plot-xs_to_m"');

  if (!storylineElement) return null;
  const storylineText = storylineElement.textContent;

  console.log({ storylineText });
  return storylineText;
}
