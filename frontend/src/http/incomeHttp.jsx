export async function newIncome({ userId, values, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/incomes/`,
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

export async function fetchIncomes({
  userId,
  token,
  pageSize,
  year,
  month,
  pageNumber,
}) {
  let url = "";

  if (year === "" && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/incomes/pages?pageSize=${pageSize}&sortBy=date&pageNumber=${pageNumber}`;
  } else if (year && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/incomes/pages?pageSize=${pageSize}&sortBy=date&year=${year}&pageNumber=${pageNumber}`;
  } else if (year && month) {
    url = `http://localhost:8080/expense-tracker/api/v1/incomes/pages?pageSize=${pageSize}&sortBy=date&year=${year}&month=${month}&pageNumber=${pageNumber}`;
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

export async function fetchIncomeById({ id, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/incomes/${id}`,
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

export async function updateIncomesById({ id, values, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/incomes/${id}`,
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

export async function deleteIncomeById({ id, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/incomes/${id}`,
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

export async function fetchIncomeYears({ token, userId, yearLimit }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/incomes/years?yearLimit=${
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

export async function fetchAllIncomes({ userId, token, year, month }) {
  let url = "";

  if (year === "" && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/incomes/`;
  } else if (year && month === "") {
    url = `http://localhost:8080/expense-tracker/api/v1/incomes/?year=${year}`;
  } else if (year && month) {
    url = `http://localhost:8080/expense-tracker/api/v1/incomes/?year=${year}&month=${month}`;
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

export async function latestAddedIncome({ userId, token }) {
  const response = await fetch(
    `http://localhost:8080/expense-tracker/api/v1/incomes/last-added`,
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
