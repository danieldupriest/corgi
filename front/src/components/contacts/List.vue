<template>
  <div>
    <h2>Contacts</h2>
    <table v-if="contacts" class="styled-table">
      <thead>
        <tr>
          <th v-for="(field, index) in dbFields" :key="index">
            {{ field.pretty_name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(contact, index1) in contacts" :key="index1">
          <td v-for="(field, index2) in dbFields" :key="index2">
            {{ prettyField(field, contact[field.name]) }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No contacts in database.</p>
  </div>
</template>

<script>
const axios = require("axios");
const { jsonFieldToDisplayField } = require("../../utils.js");

export default {
  name: "ListContacts",
  data() {
    return {
      contacts: null,
      dbFields: null,
    };
  },
  methods: {
    prettyField(field, input) {
      return jsonFieldToDisplayField(field, input);
    },
    load() {
      const url = process.env.VUE_APP_BASE_URL + "/api/contacts";
      console.log(url);
      axios
        .get(url)
        .then((res) => {
          this.contacts = res.data.contacts;
          this.dbFields = res.data.dbFields;
          /*this.contacts.forEach((contact) => {
            this.dbFields.forEach((field) => {
              console.log(contact[field.name]);
            });
          });*/
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
  mounted() {
    console.log("Mounted list");
    this.load();
  },
};
</script>

<style scoped>
</style>
