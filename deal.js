import { getDealById, formatDate, incrementDealClicks, trackMetric } from "./app.js";

const params = new URLSearchParams(window.location.search);
const dealId = params.get("id");

const titleEl = document.getElementById("dealTitle");
const brandEl = document.getElementById("dealBrand");
const discountEl = document.getElementById("dealDiscount");
const expiresEl = document.getElementById("dealExpires");
const descEl = document.getElementById("dealDescription");
const copyButton = document.getElementById("copyCoupon");
const getButton = document.getElementById("goReferral");
const toast = document.getElementById("dealToast");
const schemaNode = document.getElementById("couponSchema");

async function init() {
  if (!dealId) {
    titleEl.textContent = "Deal not found";
    return;
  }

  const deal = await getDealById(dealId);
  if (!deal) {
    titleEl.textContent = "Deal not found";
    return;
  }

  titleEl.textContent = deal.title || "Untitled deal";
  brandEl.textContent = deal.brand || "Unknown brand";
  discountEl.textContent = deal.discount || "Deal Inside";
  expiresEl.textContent = formatDate(deal.expiresAt || deal.expire);
  descEl.textContent = deal.description || "No extra description provided.";

  copyButton.addEventListener("click", async () => {
    if (!deal.coupon) return;
    await navigator.clipboard.writeText(deal.coupon);
    await trackMetric(deal.id, "couponCopies");
    toast.textContent = `Copied: ${deal.coupon}`;
    setTimeout(() => (toast.textContent = ""), 1600);
  });

  getButton.addEventListener("click", async () => {
    if (!deal.referralLink) return;
    await Promise.all([incrementDealClicks(deal.id), trackMetric(deal.id, "clicks")]);
    window.open(deal.referralLink, "_blank", "noopener");
  });

  schemaNode.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Offer",
    name: deal.title,
    description: deal.description,
    priceCurrency: "USD",
    seller: { "@type": "Organization", name: deal.brand },
    category: deal.category,
    availabilityEnds: deal.expiresAt?.toDate ? deal.expiresAt.toDate().toISOString() : undefined
  });
}

init();
