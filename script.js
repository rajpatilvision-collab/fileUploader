let moduleName = null;
let recordId = null;
const MAX_FILES = 3;

const uploadBtn = document.getElementById("uploadBtn");
const errorMsg = document.getElementById("errorMsg");
const fileUploader = document.getElementById("fileUploader");

uploadBtn.disabled = true;

/* INIT */
ZOHO.embeddedApp.on("PageLoad", function (data) {
  if (!data || !data.Entity || !data.EntityId || !data.EntityId.length) {
    errorMsg.innerText = "Open this widget from a record page.";
    return;
  }

  moduleName = data.Entity;
  recordId = data.EntityId[0];

  uploadBtn.disabled = false;
});

ZOHO.embeddedApp.init();

/* FILE VALIDATION */
fileUploader.addEventListener("change", () => {
  errorMsg.innerText = "";

  if (fileUploader.files.length > MAX_FILES) {
    errorMsg.innerText = `You can upload maximum ${MAX_FILES} files only.`;
    fileUploader.value = "";
  }
});

/* UPLOAD FILES */
uploadBtn.addEventListener("click", async () => {
  errorMsg.innerText = "";

  const files = fileUploader.files;

  if (!files || files.length === 0) {
    errorMsg.innerText = "Please select at least one file.";
    return;
  }

  if (files.length > MAX_FILES) {
    errorMsg.innerText = `You can upload max ${MAX_FILES} files only.`;
    return;
  }

  try {
    for (let i = 0; i < files.length; i++) {
      let formData = new FormData();
      formData.append("file", files[i]);

      await ZOHO.CRM.CONNECTION.invoke("my_connection", {
        method: "POST",
        url: `https://www.zohoapis.com/crm/v8/${moduleName}/${recordId}/Attachments`, // ✅ FIXED
        headers: {
          "Content-Type": "multipart/form-data"
        },
        body: formData
      });
    }

    alert("Files uploaded successfully ✔");
    fileUploader.value = "";

  } catch (err) {
    console.error(err);
    errorMsg.innerText = "Upload failed. Please try again.";
  }
});

