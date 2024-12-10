import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './create-event.dto';
import { Event } from './event.schema';
import { FilterEventDto } from './filter-event.dto';
import { each } from 'lodash';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async fetchById(id: string): Promise<Event> {
    return await this.eventModel.findById(id).exec();
  }

  async updateById(
    id: string,
    updateObject: Partial<CreateEventDto>,
  ): Promise<any> {
    return await this.eventModel
      .updateOne(
        {
          _id: id, // find query
        },
        updateObject,
      )
      .exec();
  }

  async fetchWithFilters(filters: FilterEventDto): Promise<any[]> {
    const partipantsQuery = [];
    each(filters.participants, (participant) => {
      partipantsQuery.push({
        participants: {
          idType: participant.idType,
          idValue: participant.idValue,
        },
      });
    });

    let query = {
      $and: [
        {
          $or: [
            {
              start_time: {
                $lt: filters.startTime,
              },
              end_time: {
                $gt: filters.startTime,
              },
            },
            {
              start_time: {
                $gte: filters.startTime,
                $lt: filters.endTime,
              },
            },
          ],
        },
        {
          $or: partipantsQuery,
        },
      ],
      type: {
        $in: filters.type,
      },
    };
    if (filters.status) {
      query = {
        ...query,
        ...{
          status: {
            $in: filters.status,
          },
        },
      };
    }
    console.log('query', JSON.stringify(query));
    return await this.eventModel.find(query).sort('start_time').exec();
  }
}
