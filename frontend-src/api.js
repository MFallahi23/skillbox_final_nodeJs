const PREFIX = "/notes";

const req = (url, options = {}) => {
  const { body } = options;

  return fetch((PREFIX + url).replace(/\/\/$/, ""), {
    ...options,
    body: body ? JSON.stringify(body) : null,
    headers: {
      ...options.headers,
      ...(body
        ? {
            "Content-Type": "application/json",
          }
        : null),
    },
  }).then(async (res) => {
    if (res.ok) {
      return res.json();
    } else {
      const errorData = await res.json().catch(() => null);
      const message = errorData?.error || "Unknown error";
      throw new Error(message);
    }
  });
};

export const getNotes = async ({ age, search, page } = {}) => {
  return req(`/?age=${age}&page=${page}&search=${search}`);
};

export const createNote = (title, text) => {
  return req("/", {
    method: "POST",
    body: { title, text },
  });
};

export const getNote = (id) => {
  return req(`/${id}`);
};

export const archiveNote = (id) => {
  return req(`/${id}/archive`, { method: "PATCH" });
};

export const unarchiveNote = (id) => {
  return req(`/${id}/unarchive`, { method: "PATCH" });
};

export const editNote = (id, title, text) => {
  return req(`/${id}`, {
    method: "PATCH",
    body: { title, text },
  });
};

export const deleteNote = (id) => {
  return req(`/${id}`, {
    method: "DELETE",
  });
};

export const deleteAllArchived = () => {
  return req("/archive", {
    method: "DELETE",
  });
};

export const notePdfUrl = (id) => `/notes/${id}/pdf`;
