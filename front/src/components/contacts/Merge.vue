<template>
  <div>
    <h2>Merge Contacts</h2>
    <div v-if="duplicates">
      <p>
        The following duplicate contacts require manual merging. If you wish to
        combine the contacts, select which value (existing or new) you wish to
        use for every field, then click "Save". If you would like to have the
        rows separate,
      </p>
      <table class="styled-table">
        <thead>
          <tr>
            <th v-for="(userField, index) in userFields" :key="index">
              {{ userField }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(contact, index1) in contacts.slice(0, 10)" :key="index1">
            <td v-for="(userField, index2) in userFields" :key="index2">
              {{ contact[userField] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No duplicates found.</p>
    </div>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "Config",
  data() {
    return {
      duplicates: null,
      dbFields: null,
    };
  },
  methods: {
    load() {
      const url =
        process.env.VUE_APP_BASE_URL +
        "/api/contacts/upload/" +
        this.mergeId +
        "/headers";
      axios
        .get(url)
        .then((res) => {
          if (res.status != 200) {
            return console.error(`Unexpected status code.`);
          }
          this.dbFields = res.data.dbFields;
          this.userFields = res.data.headers;
          this.contacts = res.data.contacts;
          this.guessSourceFields();
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
  mounted() {
    this.mergeId = this.$route.params.mergeId;
    //this.load();
  },
};
</script>/

<style scoped>
</style>
