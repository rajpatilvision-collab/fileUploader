const uploadBtn = document.getElementById("uploadBtn");
const fileUploader = document.getElementById("fileUploader");
const errorMsg = document.getElementById("errorMsg");

let moduleName = null;
let recordId = null;

ZOHO.embeddedApp.on("PageLoad", function (data) {
    moduleName = data.Entity;
    recordId = data.EntityId[0];

    console.log("Ready for:", moduleName, recordId);
});

ZOHO.embeddedApp.init();

uploadBtn.addEventListener("click", async function () {
    errorMsg.innerText = "";

    if (!fileUploader.files || fileUploader.files.length === 0) {
        errorMsg.innerText = "Please select a file first.";
        return;
    }

    const file = fileUploader.files[0];

    console.log("Selected file:", file);
    console.log("Is File object:", file instanceof File);

    try {
        const response = await ZOHO.CRM.API.attachFile({
            Entity: moduleName,      // "Accounts"
            RecordID: recordId,      // current record id
            File: [file]             // 🔥 MUST BE ARRAY
        });

        console.log("Upload response:", response);

        if (
            response &&
            response.data &&
            response.data[0] &&
            response.data[0].code === "SUCCESS"
        ) {
            alert("File uploaded successfully!");
            fileUploader.value = "";
        } else {
            throw new Error("Upload failed");
        }

    } catch (err) {
        console.error(err);
        errorMsg.innerText = "Upload failed: " + err.message;
    }
});


