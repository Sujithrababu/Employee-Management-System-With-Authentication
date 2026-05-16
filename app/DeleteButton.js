"use client";

import { deleteEmployee } from "./actions";

export default function DeleteButton({ id }) {
  return (
    <form
      action={deleteEmployee}
      onSubmit={(event) => {
        if (!confirm("Delete this employee?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="danger">Delete</button>
    </form>
  );
}
