
export const subjects = [
  { name: "Afsl.prv: Webud", friendly_name: "Svendeprøve" },
  { name: "Data/komm.udd.", friendly_name: "Webudvikler" },
  { name: "graf prod work3", friendly_name: "Grafisk Produktion" },
  { name: "Grafisk teknik.", friendly_name: "Grafisk Tekniker" },
  { name: "MoGr medie i be", friendly_name: "Medie i bevægelse" },
  { name: "iværk innova", friendly_name: "Iværksætteri og innovation" },
  { name: "komm formid lll", friendly_name: "Kommunikation og formidling" },
  { name: "a3dtypo", friendly_name: "Adobe After Effects" },
  { name: "dmålgruppe", friendly_name: "Adobe After Effects" },
  { name: "ggrafikopgaver", friendly_name: "Adobe Illustrator" },
  { name: "andre trykmetod", friendly_name: "Andre trykmetoder" },
  { name: "graf tekno udv", friendly_name: "Grafisk teknologisk udvikling" },
  { name: "Graf.tekn.", friendly_name: "Grafisk Teknik" },
  { name: "AMU indmeld", friendly_name: "AMU Efteruddannelse" },
  { name: "Dataserv.", friendly_name: "Dataservices" },
  { name: "Web m CMS 1", friendly_name: "CMS" },
  { name: "anima interakt", friendly_name: "Animation & Interaktion" },
  { name: "matematik", friendly_name: "Matematik" },
  { name: "komm formidl ll", friendly_name: "Kommunikation og formidling" },
  { name: "Offsettryk_mat", friendly_name: "Offset tryk" },
  { name: "markedsf brand", friendly_name: "Markedsføring & Branding" }
];


export const validEducations = [
  "AMU indmeld",
  "Brobyg teknisk",
  "Data/komm.udd.",
  "Grafisk Tekniker",
  "Grafisk teknik.",
  "Mediegrafiker",
  "Webudvikler"
];


export function getFriendlySubject(subjectName) {
  if (!subjectName) return "";

  const lower = subjectName.toLowerCase();

  const match = subjects.find((s) =>
    lower.includes(s.name.toLowerCase())
  );

  return match ? match.friendly_name : subjectName;
}