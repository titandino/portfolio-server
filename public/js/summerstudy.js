let CATEGORIES = [
  {
    name: 'external-antimicrobials',
    drugs: ['betadine', 'hibiclens', 'clorohexidine', 'gluconates']
  },
  {
    name: 'anticonvulsants',
    drugs: ['diazepam (valium)', 'lorazepam (ativan)', 'phenytoin (dilantin)']
  },
  {
    name: 'antiarrythmics',
    drugs: ['amiodarone (pacerone)', 'lidocaine (xylocaine)', 'quinidine']
  },
  {
    name: 'cathartics',
    drugs: ['polyethylene-glycol (miralax)', 'magnesium-citrate', 'bisacodyl (dulolax)']
  },
  {
    name: 'antagonists',
    drugs: ['flumazenil (romazicon)', 'naloxone (narcan)']
  },
  {
    name: 'anticoagulants',
    drugs: ['plavix', 'eliquis', 'xarelto', 'pradaxal', 'haparin', 'warfarin (coumadin)']
  },
  {
    name: 'opiods',
    drugs: ['hydrocodone (vicodin)', 'oxycodone (percocet)']
  },
  {
    name: 'antihistamines',
    drugs: ['diphenhydramine hydrochloride (benadryl)', 'epinephrine (adrenaline)', 'solu medrol']
  },
  {
    name: 'bronchodilators',
    drugs: ['theophylline (Theo-Dur)', 'aminophylline', 'albuterol']
  },
  {
    name: 'internal-antimicrobials',
    drugs: ['penicillin', 'tetracycline', 'sulfadiazine', 'erythromycin', 'cephalosporins']
  },
];

CATEGORIES.forEach(category => {
  $('#categories').append('<section id='+category.name+'><h4>'+category.name+'</h4></section>');
  category.drugs.forEach(drug => {
    $('#drugs').append('<p>'+drug+'</p>');
  });
});
