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
        .post("http://localhost:3000/api/contacts/upload", formData)
        .then((res) => {
          if (res.status == 200) {
            console.debug(`Loaded file: ${file}`);
            const file = res.data.file;
            this.$router.push("/contacts/config/" + file);
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
