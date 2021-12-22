<template>
  <div>
    <h2>Configure Contact Merge</h2>
    <div v-if="userFields">
      <p>
        Please select the field(s) you wish to use to uniquely identify rows,
        and detect duplicate entries. First and last names, or street no. and
        address are good combinations.
      </p>
      <h3>Fields to match</h3>
      <div class="fields-to-match" v-for="field in dbFields" :key="field.name">
        <input
          :id="field.name + '-match'"
          type="checkbox"
          v-model="config.matchFields[field.name]"
          true-value="yes"
          false-value="no"
        />
        <label :for="field.name + '-match'">
          {{ field.pretty_name }}
        </label>
      </div>
      <h3>Field merge options</h3>
      <p>
        Next, choose which fields in your file should be used to populate the
        database fields. If your header names are somewhat similar to the
        database's (shown in bold), they may be automatically detected by the
        application.
      </p>
      <p>
        Finally, choose the merge method for each field. This will determine
        what actions will happen automatically, and how duplicate entries will
        be handled. The following options are available:
      </p>
      <p>
        Some sample rows from the uploaded CSV file are shown below to help you
        configure the merge.
      </p>
      <ul>
        <li>
          Auto - If one faield contains text and one doesn't, the text will be
          used to fill the field.
        </li>
        <li>Use existing - The value in the existing row will be kept.</li>
        <li>
          Use new - The value in the newly imported row will overwrite the
          existing.
        </li>
        <li>
          Custom - Ignore both existing and new field values and overwrite with
          this one instead.
        </li>
        <li>
          Add tag - For comma-separated list fields (such as 'tags' and
          'votes'), this will add one or more tags to the list.
        </li>
      </ul>
      <form onsubmit="return false;">
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
                  v-model="config.mergeMethods[dbField.name]"
                  checked
                />
                <label :for="dbField.name + '-auto'">Auto</label>
                <br />
                <input
                  type="radio"
                  :id="dbField.name + '-use-existing'"
                  :name="dbField.name + '-merge-method'"
                  value="use-existing"
                  v-model="config.mergeMethods[dbField.name]"
                />
                <label :for="dbField.name + '-use-existing'">Use existing</label
                ><br />
                <input
                  type="radio"
                  :id="dbField.name + '-use-new'"
                  :name="dbField.name + '-merge-method'"
                  value="use-new"
                  v-model="config.mergeMethods[dbField.name]"
                />
                <label :for="dbField.name + '-use-new'">Use new</label>
                <br />
                <input
                  type="radio"
                  :id="dbField.name + '-custom'"
                  :name="dbField.name + '-merge-method'"
                  value="custom"
                  v-model="config.mergeMethods[dbField.name]"
                />
                <label
                  v-if="dbField.type == 'tags'"
                  :for="dbField.name + '-custom'"
                  >Add tag</label
                >
                <label v-else :for="dbField.name + '-custom'">Custom</label>
                <input
                  class="custom-field"
                  type="text"
                  :name="dbField.name + '-custom'"
                  placeholder="custom value"
                  v-model="config.customFields[dbField.name]"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="submitForm">Submit</button>
      </form>
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
      mergeId: null,
      userFields: null,
      config: {
        customFields: {},
        matchFields: [],
        mergeMethods: {},
        sourceFields: {},
      },
    };
  },
  methods: {
    atLeastOneMatchSelected() {
      for (const key in this.config.matchFields) {
        if (this.config.matchFields[key] == "yes") return true;
      }
      return false;
    },
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
        const guess = fm.get(dbField.pretty_name).value;
        this.config.sourceFields[dbField.name] = guess;
      });
    },
    initializeConfig() {
      fields.forEach((field) => {
        const name = field.name;
        this.config.customFields[name] = "";
        this.config.mergeMethods[name] = "auto";
        this.config.matchFields[name] = "no";
      });
    },
    submitForm() {
      if (!this.atLeastOneMatchSelected()) {
        return console.log(
          "At least one field must be selected for matching before you can merge."
        );
      }
      const url =
        process.env.VUE_APP_BASE_URL +
        "/api/contacts/" +
        this.mergeId +
        "/merge";
      axios
        .post(url, this.config)
        .then((res) => {
          if (res.status != 200) {
            return console.error(`Unexpected status code.`);
          }
        })
        .catch((err) => {
          throw new Error(`Problem connecting to URL ${URL}:` + err);
        });
    },
  },
  mounted() {
    this.mergeId = this.$route.params.mergeId;
    this.load();
    this.initializeConfig();
  },
};
</script>/

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
