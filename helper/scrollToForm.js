export default function scrollToForm() {
  const formContainer = document.getElementById("form-container");
  if (formContainer) {
    formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
