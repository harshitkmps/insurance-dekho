import newrelic from 'newrelic/index';
import { NewRelicEventTypes } from '@app/enums/NewRelicEventTypes';

class NewRelicHelper {
    
    public emitCustomEvent(
        eventType: NewRelicEventTypes, 
        attributes: { [key: string]: string | number | boolean } 
    ) {
        newrelic.recordCustomEvent(eventType, attributes);
    }
}

export default new NewRelicHelper();