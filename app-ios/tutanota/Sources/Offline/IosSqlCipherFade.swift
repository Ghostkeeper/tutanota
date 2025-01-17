import Foundation

class IosSqlCipherFacade: SqlCipherFacade {
  private var db: SqlCipherDb? = nil
  var openedDb: SqlCipherDb {
    get {
      guard let db = self.db else {
        fatalError("no db opened!")
      }
      return db
    }
  }

  func run(_ query: String, _ params: [TaggedSqlValue]) async throws {
    let prepped = try! self.openedDb.prepare(query: query)
    try! prepped.bindParams(params).run()
    return
  }

  func get(_ query: String, _ params: [TaggedSqlValue]) async throws -> [String : TaggedSqlValue]? {
    let prepped = try! self.openedDb.prepare(query: query)
    return try! prepped.bindParams(params).get()
  }

  func all(_ query: String, _ params: [TaggedSqlValue]) async throws -> [[String : TaggedSqlValue]] {
    let prepped = try! self.openedDb.prepare(query: query)
    return try! prepped.bindParams(params).all()
  }

  func openDb(_ userId: String, _ dbKey: DataWrapper) async throws {
    let db = SqlCipherDb(userId)
    try db.open(dbKey.data)
    self.db = db
  }

  func closeDb() async throws {
    if self.db == nil {
      return
    }
    self.db!.close()
    self.db = nil
  }

  func deleteDb(_ userId: String) async throws {
    if let db = self.db, db.userId == userId {
        db.close()
    }
    
    do {
      try FileUtils.deleteFile(path: makeDbPath(userId))
    } catch {
      let err = error as NSError
      if err.domain == NSPOSIXErrorDomain && err.code == ENOENT {
        // we don't care
      } else if let underlyingError = err.userInfo[NSUnderlyingErrorKey] as? NSError,
                underlyingError.domain == NSPOSIXErrorDomain && underlyingError.code == ENOENT {
        // we don't care either
      } else {
        throw error
      }
    }
  }
}
