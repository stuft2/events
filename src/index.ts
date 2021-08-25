export type EventHandlerPayload<EventType extends string = string> = { eventType: EventType }
export type EventHandler<EventType extends string = string> = (payload: EventHandlerPayload<EventType>) => Promise<unknown> | unknown

export function emit (eventType?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value
    descriptor.value = async function (this: EventEmitter) {
      const result = await original(...arguments)
      await this.emit(eventType || propertyKey, { target: this.constructor.name, arguments })
      return result
    }
  }
}

export class EventEmitter<EventType extends string = string> {
  handlers: Record<string, EventHandler[]> = {}

  on (event: EventType, handler: EventHandler<EventType>): this {
    if (!(event in this.handlers)) {
      this.handlers[event] = []
    }
    this.handlers[event].push(handler as unknown as EventHandler)
    return this
  }

  off (event: EventType, handler: EventHandler<EventType>): this {
    if (!(event in this.handlers)) return this
    const index = this.handlers[event].indexOf(handler as unknown as EventHandler)
    if (index !== -1) this.handlers[event].splice(index, 1)
    return this
  }

  once (event: EventType, handler: EventHandler<EventType>) {
    const offWrapper = async (payload: EventHandlerPayload<EventType>) => {
      this.off(event, offWrapper)
      return await handler(payload)
    }
    return this.on(event, offWrapper)
  }

  async emit<T extends Record<string, unknown>> (event: EventType, payload?: T): Promise<this> {
    if (!(event in this.handlers)) return this
    const fullPayload: EventHandlerPayload<EventType> = {
      ...payload,
      eventType: event
    }
    await Promise.all(this.handlers[event].map(handler => handler(fullPayload)))
    return this
  }
}
