<template>
  <div>
    <h2>Configure Merge</h2>
    <div v-if="userFields">
      <p>
        {{ userFields.length }} columns were found. Select the source for each
        field you wish to import. Fields for which there is no data can be set
        to "Ignore".
      </p>
      <form>
        <table class="styled-table">
          <tbody>
            <tr>
              <td v-for="(dbField, index) in dbFields" :key="index">
                <h4>
                  {{ dbField.pretty_name }}
                </h4>
                <label :for="dbField.name + '-source-label'">
                  Source field:
                </label>
                <select
                  class="field-selector"
                  :id="dbField.name + '-source-selector'"
                  v-model="config.sourceFields[dbField.name]"
                >
                  <option
                    v-for="(userField, index) in userFields"
                    :key="index"
                    :value="userField"
                    :selected="config.sourceFields[dbField.name] == userField"
                  >
                    {{ userField }}
                  </option>
                </select>
                <div>Merge method:</div>
                <input
                  type="radio"
                  :id="dbField.name + '-auto'"
                  :name="dbField.name + '-merge-method'"
                  value="auto"
                  checked
                />
                <label :for="dbField.name + '-auto'">Auto</label>
                <br />
                <input
                  type="radio"
                  :id="dbField.name + '-use-existing'"
                  :name="dbField.name + '-merge-method'"
                  value="use-existing"
                />
                <label :for="dbField.name + '-user-existing'"
                  >Use existing</label
                ><br />
                <input
                  type="radio"
                  :id="dbField.name + '-use-new'"
                  :name="dbField.name + '-merge-method'"
                  value="use-new"
                />
                <label :for="dbField.name + '-use-new'">Use new</label>
                <br />
                <input
                  type="radio"
                  :id="dbField.name + '-custom'"
                  :name="dbField.name + '-merge-method'"
                  value="custom"
                />
                <label :for="dbField.name + '-custom'">Custom</label>
                <input
                  class="custom-field"
                  type="text"
                  :name="dbField.name + '-custom'"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <h3>Sample rows from CSV file</h3>
        <table class="styled-table">
          <thead>
            <tr>
              <th v-for="(userField, index) in userFields" :key="index">
                {{ userField }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(contact, index1) in contacts" :key="index1">
              <td v-for="(userField, index2) in userFields" :key="index2">
                {{ contact[userField] }}
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
const FuzzyMatching = require("fuzzy-matching");
const { fields } = require("../fields");

export default {
  name: "Config",
  data() {
    return {
      contacts: null,
      dbFields: fields,
      userFields: null,
      config: {
        sourceFields: {},
      },
    };
  },
  methods: {
    load(file) {
      const url = "http://localhost:3000/api/contacts/config/" + file;
      axios
        .get(url)
        .then((res) => {
          this.userFields = res.data.headers;
          this.contacts = res.data.contacts;
          this.guessSourceFields();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    guessSourceFields() {
      this.dbFields.forEach((dbField) => {
        const fm = new FuzzyMatching(this.userFields);
        console.log(`Options: ${this.userFields}`);
        console.log(`Checking for ${dbField.pretty_name}`);
        const guess = fm.get(dbField.pretty_name).value;
        this.config.sourceFields[dbField.name] = guess;
        console.log(`Set config.sourceFields.${dbField.name} to ${guess}`);
      });
    },
  },
  mounted() {
    const file = this.$route.params.file;
    console.debug(`Configuring import of file ${file}.`);
    this.load(file);
  },
};
</script>

<style scoped>
.field-selector {
  display: block;
  margin-bottom: 1rem;
  width: 10rem;
}
.custom-field {
  width: 10rem;
}
</style>
