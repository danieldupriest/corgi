<template>
  <div>
    <div v-if="!mergeDone">
      <h2>Configure Contact Merge</h2>
      <div v-if="userFields">
        <p>
          Please select the field(s) you wish to use to uniquely identify rows,
          and detect duplicate entries. First and last names, or street no. and
          address are good combinations.
        </p>
        <h3>Fields to match</h3>
        <div
          class="fields-to-match"
          v-for="field in filteredDbFields"
          :key="field.name"
        >
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
          Some sample rows from the uploaded CSV file are shown below to help
          you configure the merge.
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
            Custom - Ignore both existing and new field values and overwrite
            with this one instead.
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
                <td v-for="(dbField, index) in filteredDbFields" :key="index">
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
                  <div
                    class="method"
                    v-bind:class="{ hidden: hideField(dbField.name) }"
                  >
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
                    <label :for="dbField.name + '-use-existing'"
                      >Use existing</label
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
                      >Add tag(s)</label
                    >
                    <label v-else :for="dbField.name + '-custom'">Custom</label>
                    <input
                      class="custom-field"
                      type="text"
                      :name="dbField.name + '-custom'"
                      placeholder="custom value"
                      v-model="config.customFields[dbField.name]"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <button @click="saveConfigAndGetEstimates">Preview</button>
          <button @click="beginMerge">Merge</button>
          <div id="estimates" v-if="newImports != null">
            <h3>Estimated result of configuration</h3>
            <ul>
              <li>{{ newImports }} contact(s) will be newly imported.</li>
              <li>{{ autoMerges }} contact(s) will be automatically merged.</li>
              <li>
                {{ manualMerges }} contact(s) will require manual merging.
              </li>
            </ul>
          </div>
        </form>
        <h3>Sample rows from CSV file</h3>
        <table class="styled-table">
          <thead>
            <tr>
              <th v-for="(userField, index) in filteredUserFields" :key="index">
                {{ userField }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(contact, index1) in contacts.slice(0, 10)"
              :key="index1"
            >
              <td
                v-for="(userField, index2) in filteredUserFields"
                :key="index2"
              >
                {{ contact[userField] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <h2>Merge Results</h2>
      <p>Automatic merge step completed with the following results:</p>
      <ul>
        <li>{{ newImportCount }} contact(s) were newly imported.</li>
        <li>{{ automaticMergeCount }} contact(s) were automatically merged.</li>
        <li>{{ manualMergeCount }} contact(s) still require manual merging.</li>
      </ul>
      <button v-if="manualMergeCount > 0" @click="nextStep">
        Begin manual merge
      </button>
    </div>
  </div>
</template>

<script>
const axios = require("axios").default;
const FuzzyMatching = require("fuzzy-matching");

export default {
  name: "Config",
  data() {
    return {
      contacts: null,
      dbFields: null,
      mergeId: null,
      newImports: null,
      autoMerges: null,
      manualMerges: null,
      userFields: null,
      mergeDone: false,
      newImportCount: 0,
      automaticMergeCount: 0,
      manualMergeCount: 0,
      config: {
        customFields: {},
        matchFields: {},
        matchFieldsArray: [],
        mergeMethods: {},
        sourceFields: {},
      },
    };
  },
  computed: {
    filteredDbFields() {
      const result = [];
      this.dbFields.forEach((field) => {
        if (!field.readOnly) {
          result.push(field);
        }
      });
      return result;
    },
    filteredUserFields() {
      const result = [];
      this.userFields.forEach((field, index) => {
        if (index != 0) {
          result.push(field);
        }
      });
      return result;
    },
  },
  methods: {
    atLeastOneMatchSelected() {
      for (const key in this.config.matchFields) {
        if (this.config.matchFields[key] == "yes") return true;
      }
      return false;
    },
    loadHeadersAndSampleContacts() {
      const url =
        process.env.VUE_APP_BASE_URL +
        "/api/contacts/upload/" +
        this.mergeId +
        "/headers";
      axios
        .get(url)
        .then((res) => {
          this.dbFields = res.data.dbFields;
          this.userFields = ["none"].concat(res.data.headers);
          this.contacts = res.data.contacts;
          this.guessSourceFields();
          this.initializeConfig();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    guessSourceFields() {
      this.dbFields.forEach((dbField) => {
        const fm = new FuzzyMatching(this.userFields);
        let guess = fm.get(dbField.pretty_name).value;
        if (guess == null) {
          guess = this.userFields[0];
        }
        this.config.sourceFields[dbField.name] = guess;
      });
    },
    initializeConfig() {
      this.dbFields.forEach((field) => {
        const name = field.name;
        this.config.customFields[name] = "";
        this.config.mergeMethods[name] = "auto";
        this.config.matchFields[name] = "no";
      });
    },
    async saveConfigAndGetEstimates(showEstimates = true) {
      if (!this.atLeastOneMatchSelected()) {
        return console.log(
          "At least one field must be selected for matching before you can merge."
        );
      }
      this.config.matchFieldsArray = [];
      for (const [key, value] of Object.entries(this.config.matchFields)) {
        if (value == "yes") {
          this.config.matchFieldsArray.push(key);
        }
      }
      const url =
        process.env.VUE_APP_BASE_URL +
        "/api/contacts/upload/" +
        this.mergeId +
        "/configure";
      const result = await axios.post(url, { config: this.config });
      this.newImports = result.data.newImports;
      this.autoMerges = result.data.autoMerges;
      this.manualMerges = result.data.manualMerges;
      if (showEstimates) {
        window.setTimeout(() => {
          const estimates = document.getElementById("estimates");
          estimates.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    },
    nextStep() {
      this.$router.push("/contacts/upload/" + this.mergeId + "/merge");
    },
    async beginMerge() {
      await this.saveConfigAndGetEstimates(false);
      const url =
        process.env.VUE_APP_BASE_URL +
        "/api/contacts/upload/" +
        this.mergeId +
        "/merge";
      axios
        .post(url)
        .then((result) => {
          const { newImportCount, automaticMergeCount, manualMergeCount } =
            result.data;
          this.newImportCount = newImportCount;
          this.automaticMergeCount = automaticMergeCount;
          this.manualMergeCount = manualMergeCount;
          this.mergeDone = true;
        })
        .catch((err) => {
          console.error(`Something went wrong trying to merge: ${err.message}`);
        });
    },
    hideField(fieldName) {
      if (!this.config.sourceFields) {
        return false;
      }
      if (this.config.sourceFields[fieldName] == "none") {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.mergeId = this.$route.params.mergeId;
    this.loadHeadersAndSampleContacts();
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
.hidden {
  display: none;
}
.styled-table td {
  vertical-align: top;
}
</style>
