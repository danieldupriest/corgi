<template>
  <div>
    <input type="file" @change="updateFile" ref="file">
    <button @click="submitFile">Upload</button>
    <p ref="result"></p>
  </div>
</template>

<script>
const axios = require("axios")

export default {
  name: 'Upload',
  props: {},
  data() {
    return {
      contacts: null
    }
  },
  methods: {
    updateFile() {
      this.contacts = "Hi"
      this.contacts = this.$refs.file.files[0]
    },
    submitFile() {
      const formData = new FormData()
      formData.append('file', this.contacts)
      const headers = { 'Content-Type': 'multipart/form-data' }
      axios.post('http://localhost:3000/api/contacts/upload', formData, { headers }).then((res) => {       
        console.log(res.data)
        this.$refs.result.innerHTML = res.data.message + " : " + res.data.rows
      });
    }
  }
}
</script>

<style scoped>
</style>
