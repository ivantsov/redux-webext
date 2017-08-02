import generateUUID from '../src/utils/generateUUID';

describe('generateUUID', () => {
    it('works', async() => {
        const uuid = generateUUID();
        const match = uuid.match('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');

        expect(match[0]).toEqual(uuid);
    });

    it('unique', async() => {
        const uuid1 = generateUUID();
        const uuid2 = generateUUID();

        expect(uuid1).not.toEqual(uuid2);
    });
});