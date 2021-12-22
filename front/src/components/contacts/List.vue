<template>
  <div>
    <h2>Contacts</h2>
    <table v-if="contacts.length > 0" class="styled-table">
      <thead>
        <tr>
          <th v-for="(field, index) in fields" :key="index">
            {{ field.pretty_name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(contact, index1) in contacts" :key="index1">
          <td v-for="(field, index2) in fields" :key="index2">
            {{ contact[field.name] }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No contacts in database.</p>
  </div>
</template>

<script>
const axios = require("axios");
const fields = require("../fields");

export default {
  name: "Upload",
  data() {
    return {
      contacts: null,
      fields: fields,
    };
  },
  methods: {
    loadContacts() {
      const url = process.env.VUE_APP_BASE_URL + "/api/contacts";
      axios
        .get(url)
        .then((res) => {
          this.contacts = res.data.contacts;
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
  mounted() {
    this.loadContacts();
  },
};
</script>

<style scoped>
</style>
