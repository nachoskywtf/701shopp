// Format CLP price like Chilean retail: $89.990
export const formatCLP = (n: number) =>
  "$" + Math.round(n).toLocaleString("es-CL").replace(/,/g, ".");

export const discountPct = (retail: number, price: number) =>
  Math.round(((retail - price) / retail) * 100);
