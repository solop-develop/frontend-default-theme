/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

export default [
  {
    // columnName: 'C_Location_ID',
    uuid: '8d57c1e2-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      isDisplayed: false,
      index: 10
    }
  },
  {
    // columnName: 'C_Country_ID',
    uuid: '8ceddfca-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      isActiveLogics: true, // enable logics
      defaultValue: '@#C_Country_ID@',
      size: 24,
      sequenceFields: 'CO',
      index: 20,
      isMandatory: true
    }
  },
  {
    // columnName: 'C_Region_ID',
    uuid: '8ced32aa-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      sequenceFields: 'R',
      index: 30,
      isMandatory: false
    }
  },
  // {
  //   // columnName: 'RegionName',
  //   uuid: '8d0b41be-fb40-11e8-a479-7a0060f0aa0',
  //   overwriteDefinition: {
  //     isCustomField: true,
  //     componentPath: 'FieldText',
  //     size: 24,
  //     sequenceFields: 'C',
  //     index: 40,
  //     isMandatory: false
  //   }
  // },
  {
    // columnName: 'C_City_ID',
    uuid: '8cfb4d90-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      componentPath: 'FieldSelect',
      size: 24,
      sequenceFields: 'C',
      index: 40
    }
  },
  // {
  //   // columnName: 'City',
  //   uuid: '8ced2a1c-fb40-11e8-a479-7a0060f0aa01',
  //   overwriteDefinition: {
  //     isCustomField: true,
  //     componentPath: 'FieldText',
  //     size: 24,
  //     sequenceFields: 'C',
  //     index: 40,
  //     isMandatory: false
  //   }
  // },
  {
    // columnName: 'Address1',
    uuid: '8cee7c14-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      sequenceFields: 'A1',
      index: 50
    }
  },
  {
    // columnName: 'Address2',
    uuid: '8ce862d4-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      sequenceFields: 'A2',
      isMandatory: false,
      index: 60
    }
  },
  {
    // columnName: 'Address3',
    uuid: '8d0d7b5a-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      sequenceFields: 'A3',
      isMandatory: false,
      index: 70
    }
  },
  {
    // columnName: 'Address4',
    uuid: '8d0e35d6-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      sequenceFields: 'A4',
      isMandatory: false,
      index: 80
    }
  },
  {
    // columnName: 'Postal',
    uuid: '8cee8bb4-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      sequenceFields: 'P',
      index: 90
    }
  },
  {
    // columnName: 'Postal_Add',
    uuid: '8cf1b9d8-fb40-11e8-a479-7a0060f0aa01',
    overwriteDefinition: {
      isCustomField: true,
      size: 24,
      sequenceFields: 'A',
      index: 100
    }
  }
  // {
  //   elementColumnName: 'Name',
  //   isFromDictionary: true,
  //   overwriteDefinition: {
  //     tabindex: 1,
  //     isCustomField: true,
  //     size: 24,
  //     name: language.t('components.contextMenuReferences'),
  //     sequence: 1,
  //     sequenceFields: 'P',
  //     isMandatory: true
  //   }
  // }
]
