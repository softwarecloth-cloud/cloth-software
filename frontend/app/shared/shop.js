// Single source of truth for the shop's identity — app name, printed bill
// header, contact details and logo. Change it here and it updates everywhere
// (nav bar, page titles, invoice print-out).

export const SHOP = {
  // Short name used in the app chrome and browser tab titles.
  name: "Aliff Noon",
  // Full trading name printed on the bill under the logo.
  fullName: "Miran Lajpal Ladies Collection",
  proprietor: "Azeem G",
  address: "Shop # 25-A Karachi Block, Azam Cloth Market, Lahore",
  phones: ["0324-4018005", "0311-7025800"],
  // Drop a real photo at frontend/public/aliff-noon-logo.png to override this.
  logo: "/aliff-noon-logo.jpg",
};
