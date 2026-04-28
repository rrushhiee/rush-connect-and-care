const LOCAL_TEST_HOSTS = new Set(["127.0.0.1", "localhost"]);
const JSON_ENDPOINT_MATCHERS = ["formsubmit.co/ajax/"];

function showFormStatus(form, message, type = "info") {
  let status = form.querySelector("[data-form-status]");

  if (!status) {
    status = document.createElement("p");
    status.className = `form-status form-status-${type}`;
    status.setAttribute("data-form-status", "");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.append(status);
  }

  status.className = `form-status form-status-${type}`;
  status.textContent = message;
}

function getEndpoint(form) {
  if (LOCAL_TEST_HOSTS.has(window.location.hostname)) {
    return "/__form_test__";
  }

  const configuredKey = form.dataset.formEndpoint;
  const configured = configuredKey ? window.RCC_CONFIG?.[configuredKey] : window.RCC_CONFIG?.formEndpoint;
  return configured || form.getAttribute("action") || "";
}

function shouldSubmitAsJson(endpoint) {
  return JSON_ENDPOINT_MATCHERS.some((matcher) => endpoint.includes(matcher));
}

function shouldUseNativeSubmit(endpoint) {
  const endpointUrl = new URL(endpoint, window.location.href);
  return endpointUrl.origin === window.location.origin && endpointUrl.pathname.startsWith("/forms/");
}

function canEnhanceForms() {
  return (
    typeof window.fetch === "function" &&
    typeof window.FormData === "function" &&
    typeof window.URLSearchParams === "function"
  );
}

function buildJsonPayload(form) {
  const payload = {};
  const formData = new FormData(form);
  formData.delete("_honey");

  for (const [key, value] of formData.entries()) {
    payload[key] = typeof value === "string" ? value.trim() : value;
  }

  return JSON.stringify(payload);
}

async function handleFormSubmit(event) {
  if (!canEnhanceForms()) {
    return;
  }

  const form = event.currentTarget;
  const endpoint = getEndpoint(form);

  if (shouldUseNativeSubmit(endpoint)) {
    return;
  }

  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const isLocalTest = LOCAL_TEST_HOSTS.has(window.location.hostname);
  const submitAsJson = shouldSubmitAsJson(endpoint);

  if (!endpoint || endpoint.includes("YOUR_")) {
    showFormStatus(
      form,
      "This form is not available right now. Please try again shortly, or use the phone and email links on this page.",
      "error"
    );
    return;
  }

  submitButton?.setAttribute("disabled", "disabled");
  showFormStatus(form, "Sending your message...", "info");

  try {
    if (isLocalTest || submitAsJson) {
      const headers = {
        Accept: "application/json"
      };

      if (submitAsJson) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: submitAsJson ? buildJsonPayload(form) : new FormData(form)
      });

      if (!response.ok) {
        throw new Error(`Form request failed with status ${response.status}`);
      }
    } else {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new FormData(form)
      });
    }

    const successUrl = form.dataset.successUrl || window.RCC_CONFIG?.formSuccessUrl || "thank-you.html";
    window.location.assign(successUrl);
  } catch {
    showFormStatus(
      form,
      "We could not send the form directly. Please try again shortly, or use the phone and email links on this page.",
      "error"
    );
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-rcc-form]").forEach((form) => {
    if (new URLSearchParams(window.location.search).get("form-error") === "1") {
      showFormStatus(
        form,
        "We could not send the form directly. Please use the phone or email options below if needed.",
        "error"
      );
    }

    form.addEventListener("submit", handleFormSubmit);
  });
});
