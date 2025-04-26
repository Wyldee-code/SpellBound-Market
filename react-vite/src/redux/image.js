export const createImageFileAndUrl = (imageFile) => async () => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const res = await fetch("/api/images/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { errors: errorData.errors || ["Image upload failed."] };
    }

    const data = await res.json();
    if (data.url && data.url.startsWith("http")) {
      return { url: data.url };
    } else {
      return { errors: ["Invalid image URL returned from server."] };
    }
  } catch (err) {
    console.error("Image upload error:", err);
    return { errors: ["Unexpected error during image upload."] };
  }
};

export const deleteImageFileMenuItem = (menuItemId) => async () => {
  try {
    const res = await fetch(`/api/images/menu-item/${menuItemId}/delete`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { errors: errorData.errors || ["Image deletion failed."] };
    }

    return await res.json();
  } catch (err) {
    console.error("Image delete error:", err);
    return { errors: ["Unexpected error during image deletion."] };
  }
};
