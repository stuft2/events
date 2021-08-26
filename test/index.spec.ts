import { EventEmitter, emit } from '../src'

describe('EventEmitter', () => {
  let emitter: EventEmitter
  beforeAll(() => {
    emitter = new EventEmitter()
  })

  it('should subscribe to and emit an event', async () => {
    const mock = jest.fn()
    await emitter.on('foo', mock).emit('foo')
    expect(mock.mock.calls.length).toEqual(1)
  })

  it('should do nothing if there are no subscribers', async () => {
    const mock = jest.fn()
    await emitter.on('foo', mock).emit('bar')
    expect(mock.mock.calls.length).toEqual(0)
  })

  it('should subscribe to only the first event emitted', async () => {
    const mock = jest.fn()
    emitter.once('foo', mock)
    await Promise.all([
      emitter.emit('foo'),
      emitter.emit('foo')
    ])
    expect(mock.mock.calls.length).toEqual(1)
  })

  it('should unsubscribe from an event', async () => {
    const mock = jest.fn()
    emitter.on('foo', mock)
    await emitter.off('foo', mock).emit('foo')
    expect(mock.mock.calls.length).toEqual(0)
  })

  it('should do nothing when subscription does not exist', async () => {
    const mock = jest.fn()
    const mock2 = jest.fn()
    emitter.on('foo', mock)
    emitter.on('foo', mock2)
    emitter.off('foo', mock2)
    await emitter.emit('foo')
    expect(mock.mock.calls.length).toEqual(1)
    expect(mock2.mock.calls.length).toEqual(0)
  })
})

describe('emit', () => {
  it('should emit an event after invoking a class method', async () => {
    class CustomEmitter extends EventEmitter {
      @emit()
      add (a: number, b: number): number {
        return a + b
      }
    }

    const mock = jest.fn()
    const emitter = new CustomEmitter()
    const result = await emitter.on('add', mock).add(1, 1)
    expect(result).toEqual(2)
    expect(mock.mock.calls.length).toEqual(1)
  })
})
