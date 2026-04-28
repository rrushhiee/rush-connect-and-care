const LOCAL_TEST_HOSTS = new Set(["127.0.0.1", "localhost"]);

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

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const isLocalTest = LOCAL_TEST_HOSTS.has(window.location.hostname);
  const endpoint = getEndpoint(form);

  if (!endpoint || endpoint.includes("YOUR_")) {
    showFormStatus(
      form,
      "This form is not available right now. Please call or email directly instead.",
      "error"
    );
    return;
  }

  submitButton?.setAttribute("disabled", "disabled");
  showFormStatus(form, "Sending your message...", "info");

  try {
    if (isLocalTest) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: new FormData(form)
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
      "There was a problem sending the form. Please try again, call, or email directly.",
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
        "There was a problem sending the form. Please try again, call, or email directly.",
        "error"
      );
    }

    form.addEventListener("submit", handleFormSubmit);
  });
});
