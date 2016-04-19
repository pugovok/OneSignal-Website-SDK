import { isValidUuid } from './utils.js';
import objectAssign from 'object-assign';


/**
 * Represents a structured Notification object to be displayed to the user.
 */
export default class Notification {

  constructor({id, title, message, url, icon, data, buttons}={}) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.url = url;
    this.icon = icon;
    this.data = data;
    this.buttons = buttons;
  }

  static get FORMAT() {
    return {
      /**
       * The notification format before 4/15/16 using the Google's propietary GCM format.
       *
       * Note: Action buttons are NOT supported (they are supported in ENCRYPTED_PUSH format).
       */
      LEGACY,
      /**
       * The notification format supporting the new encrypted web push protocol.
       */
      ENCRYPTED_PUSH,
      /**
       * A custom data format likely sent by the user or another push provider.
       */
      UNRECOGNIZED
    }
  }

  /**
   * Creates a new Notification from JSON data.
   * The JSON data format can be any one of the three supported formats:
   *   - The "old" notification format before SDK version 109300.
   *   - The "new" format using the new encrypted web push protocol
   */
  static fromJson(json) {
    let format = Notification.determineFormat(json);
    if (format === FORMAT.UNRECOGNIZED) {
      return null;
    } else if (format === FORMAT.LEGACY) {
      // Note: Action buttons not supported in legacy format
      return new Notification({
        id: json.custom.i,
        title: json.title,
        message: json.alert,
        url: json.custom.u,
        icon: json.icon,
        data: json.custom.a
      });
    } else if (format === FORMAT.ENCRYPTED_PUSH) {
      let jsonClone = objectAssign({}, json);
      // Remove already parsed properties; remaining properties make up additional data
      return new Notification({
        id: json.os_data.i,
        title: json.title,
        message: json.alert,
        url: json.url,
        icon: json.icon,
        data: json.custom.a,
        buttons: json.buttons
      });
    }
  }

  static determineFormat(json) {
    if (!json) {
      return FORMAT.UNRECOGNIZED;
    }
    else if (json.custom && isValidUuid(json.custom.i)) {
      return FORMAT.LEGACY;
    }
    else if (json.os_data && isValidUuid(json.os_data.i)) {
      return FORMAT.ENCRYPTED_PUSH;
    } else {
      return FORMAT.UNRECOGNIZED;
    }
  }


}