import AV from 'leanengine'

AV.init({
  appId: process.env.LEANCLOUD_APP_ID || 'ELBaq12R4z7KStmFxmHFTMoz-gzGzoHsz',
  appKey: process.env.LEANCLOUD_APP_KEY || 'ivla7obQDyez9WH0pX6HuwrK',
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || 'wv94VmOmQFvyALD9Ixj4cXlf'
})

AV.Cloud.useMasterKey()

export default AV