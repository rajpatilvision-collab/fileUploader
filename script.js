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
  console.log(`Ready for: ${moduleName}/${recordId}`);
});

ZOHO.embeddedApp.init();

/* FILE VALIDATION */
fileUploader.addEventListener("change", () => {
  errorMsg.innerText = "";

  if (fileUploader.files.length > MAX_FILES) {
    errorMsg.innerText = `You can upload maximum ${MAX_FILES} files only.`;
    fileUploader.value = "";
    uploadBtn.disabled = true;
    return;
  }
  
  // Enable button if files are selected
  uploadBtn.disabled = fileUploader.files.length === 0;
});
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
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    const filesArray = Array.from(files);
    let successCount = 0;
    
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      
      try {
        console.log(`Uploading file ${i + 1}/${filesArray.length}: ${file.name}`);
        
        // Create FormData object
        const formData = new FormData();
        formData.append("attachment", file);
        
        // Get OAuth token
        const authToken = await ZOHO.CRM.CONNECTION.getAuthToken();
        
        // Determine the correct API endpoint based on your Zoho region
        // For Zoho.in (India): https://www.zohoapis.in/crm/v2/
        // For Zoho.com (Global): https://www.zohoapis.com/crm/v2/
        const baseURL = "https://www.zohoapis.in/crm/v2/"; // Change to .in if needed
        
        const response = await fetch(
          `${baseURL}${moduleName}/${recordId}/Attachments`,
          {
            method: "POST",
            headers: {
              "Authorization": `Zoho-oauthtoken ${authToken}`,
              // Don't set Content-Type for FormData - browser sets it automatically
            },
            body: formData
          }
        );

        const result = await response.json();
        console.log("Upload response:", result);
        
        if (response.ok && result.data && result.data[0] && result.data[0].status === "success") {
          successCount++;
          console.log(`✓ File uploaded successfully: ${file.name}`);
        } else {
          console.error(`✗ Failed to upload ${file.name}:`, result);
          throw new Error(result.message || "Upload failed");
        }
        
      } catch (fileError) {
        console.error(`Failed to upload ${file.name}:`, fileError);
        errorMsg.innerText = `Failed to upload ${file.name}. Please try again.`;
        // Continue with next file
      }
      
      // Small delay between uploads
      if (i < filesArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Show result message
    if (successCount > 0) {
      alert(`Successfully uploaded ${successCount} of ${filesArray.length} file(s) ✔`);
    } else {
      alert(`Failed to upload any files. Please try again.`);
    }
    
    // Clear file input
    fileUploader.value = "";
    
  } catch (err) {
    console.error("Upload process failed:", err);
    errorMsg.innerText = `Upload failed: ${err.message}`;
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Files";
  }
});
