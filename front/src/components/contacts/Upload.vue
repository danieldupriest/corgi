<template>
  <div>
    <h2>Contact Import</h2>
    <p>
      Export your contact list as a CSV (comma-separated value) file, including
      headers, and select it below.
    </p>
    <input type="file" @change="updateFile" ref="file" />
    <button @click="submitFile">Upload</button>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "Upload",
  data() {
    return {
      contacts: null,
    };
  },
  methods: {
    updateFile() {
      this.contacts = "Hi";
      this.contacts = this.$refs.file.files[0];
    },
    submitFile() {
      const formData = new FormData();
      formData.append("file", this.contacts);
      axios
        .post(process.env.VUE_APP_BASE_URL + "/api/contacts/upload", formData)
        .then((res) => {
          if (res.status == 201) {
            const mergeId = res.data.mergeId;
            this.$router.push("/contacts/upload/" + mergeId + "/config");
          }
          this.headers = res.data.headers;
          this.contacts = res.data.contacts;
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
};
</script>

<style scoped>
input {
  display: block;
  margin-bottom: 1rem;
}
</style>
