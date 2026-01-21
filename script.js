uploadBtn.addEventListener("click", async function () {
    errorMsg.innerText = "";

    if (!fileUploader.files || fileUploader.files.length === 0) {
        errorMsg.innerText = "Please select a file first.";
        return;
    }

    const fileObj = fileUploader.files[0];

    console.log("Selected file:", fileObj);

    try {
        const response = await ZOHO.CRM.API.attachFile({
            Entity: moduleName,   // "Accounts"
            RecordID: recordId,
            File: [
                {
                    Name: fileObj.name, // 🔥 CAPITAL N (MANDATORY)
                    File: fileObj       // 🔥 actual File object
                }
            ]
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
