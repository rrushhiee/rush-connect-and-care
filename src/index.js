const CONTACT_EMAIL = "hello@rushconnectandcare.com.au";
const FORM_SUBJECTS = {
  "/forms/enquiry": "New Rush Connect & Care enquiry",
  "/forms/booking": "New Rush Connect & Care booking request",
  "/forms/newsletter": "New Rush Connect & Care newsletter sign-up"
};
const FORM_TYPES = {
  "/forms/enquiry": "Enquiry",
  "/forms/booking": "Booking request",
  "/forms/newsletter": "Newsletter sign-up"
};

function redirectTo(requestUrl, location, status = 303) {
  return Response.redirect(new URL(location, requestUrl).toString(), status);
}

function withPath(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url.toString(), request);
}

async function handleFormProxy(request) {
  const url = new URL(request.url);
  const subject = FORM_SUBJECTS[url.pathname];
  const formType = FORM_TYPES[url.pathname];

  if (!subject || request.method !== "POST") {
    return redirectTo(request.url, "/");
  }

  const formData = await request.formData();
  formData.set("_subject", subject);
  formData.set("_captcha", "false");
  formData.set("form_type", formData.get("form_type") || formType);

  const upstream = await fetch(`https://formsubmit.co/${CONTACT_EMAIL}`, {
    method: "POST",
    headers: {
      Accept: "application/json"
    },
    body: formData
  });

  if (!upstream.ok) {
    const referer = request.headers.get("Referer") || "/";
    const returnUrl = new URL(referer, request.url);
    returnUrl.searchParams.set("form-error", "1");
    return Response.redirect(returnUrl.toString(), 303);
  }

  return redirectTo(request.url, "/thank-you");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/forms/")) {
      return handleFormProxy(request);
    }

    if (url.pathname === "/index.html") {
      return redirectTo(request.url, "/", 301);
    }

    if (url.pathname.endsWith(".html")) {
      return redirectTo(request.url, url.pathname.replace(/\.html$/, ""), 301);
    }

    if (url.pathname !== "/" && !url.pathname.includes(".")) {
      const htmlResponse = await env.ASSETS.fetch(withPath(request, `${url.pathname}.html`));

      if (htmlResponse.status !== 404) {
        return htmlResponse;
      }
    }

    return env.ASSETS.fetch(request);
  }
};
