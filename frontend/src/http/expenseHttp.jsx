export async function newExpense({ userId, values, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/expenses/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(values),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }

  const result = await response.json();

  return result;
}

export async function fetchExpenses({
  userId,
  token,
  pageSize,
  year,
  month,
  pageNumber,
}) {
  let url = "";

  if (year === "" && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/expenses/pages?pageSize=${pageSize}&sortBy=date&pageNumber=${pageNumber}`;
  } else if (year && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/expenses/pages?pageSize=${pageSize}&sortBy=date&year=${year}&pageNumber=${pageNumber}`;
  } else if (year && month) {
    url = `http://localhost:8080/expense-tracker/api/v1/expenses/pages?pageSize=${pageSize}&sortBy=date&year=${year}&month=${month}&pageNumber=${pageNumber}`;
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }

  const result = await response.json();

  return result;
}

export async function fetchExpenseById({ id, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/expenses/${id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }

  const result = await response.json();

  return result;
}

export async function updateExpenseById({ id, values, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/expenses/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(values),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }

  const result = await response.json();

  return result;
}

export async function deleteExpenseById({ id, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/expenses/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }
}

export async function fetchExpenseYears({ token, userId, yearLimit }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/expenses/years?yearLimit=${
      yearLimit ? yearLimit : false
    }`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }

  const result = await response.json();

  return result;
}

export async function fetchAllExpenses({ userId, token, year, month }) {
  let url = "";

  if (year === "" && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/expenses/`;
  } else if (year && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/expenses/?year=${year}`;
  } else if (year && month) {
    url = `http://localhost:8080/expense-tracker/api/v1/expenses/?year=${year}&month=${month}`;
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }

  const result = await response.json();

  return result;
}

export async function latestAddedExpense({ userId, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/expenses/last-added`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw error.message;
  }

  const result = await response.json();

  return result;
}
