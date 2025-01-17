import {OfflineMigration} from "../OfflineStorageMigrator.js"
import {OfflineStorage} from "../OfflineStorage.js"
import {GiftCardTypeRef} from "../../../entities/sys/TypeRefs.js"
import {migrateAllListElements, removeValue} from "../StandardMigrations.js"

export const sys76: OfflineMigration = {
	app: "sys",
	version: 76,
	async migrate(storage: OfflineStorage) {
		await migrateAllListElements(GiftCardTypeRef, storage, [
			removeValue("country")
		])
	}
}
