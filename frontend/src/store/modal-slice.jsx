import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "modal",
  initialState: { modalVersion: "" },
  reducers: {
    showForm(state) {
      state.modalVersion = "form";
    },
    showAddInfo(state) {
      state.modalVersion = "info";
    },
    showDeleteModal(state) {
      state.modalVersion = "delete";
    },
    showDeleteInfo(state) {
      state.modalVersion = "deleteInfo";
    },
    showUpdateInfo(state) {
      state.modalVersion = "updateInfo";
    },
    showSessionExpiredInfo(state) {
      state.modalVersion = "sessionExpired";
    },
    showInProgress(state) {
      state.modalVersion = "inProgress";
    },
    loginInfoModal(state) {
      state.modalVersion = "loginInfo";
    },
    closeModal(state) {
      state.modalVersion = "";
    },
  },
});

export const modalActions = modalSlice.actions;

export default modalSlice;
