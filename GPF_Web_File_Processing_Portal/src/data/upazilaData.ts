// Comprehensive Upazila and Default ID Data based on Official Upazila Directory

export interface UpazilaRecord {
  division: string;
  divisionBn: string;
  district: string;
  districtBn: string;
  upazila: string;
  upazilaBn: string;
  defaultId: string;
  email: string;
}

// Bengali mapping for divisions
const DIVISION_BN_MAP: Record<string, string> = {
  Dhaka: 'ঢাকা',
  Chattogram: 'চট্টগ্রাম',
  Rajshahi: 'রাজশাহী',
  Khulna: 'খুলনা',
  Barishal: 'বরিশাল',
  Sylhet: 'সিলেট',
  Rangpur: 'রংপুর',
  Mymensingh: 'ময়মনসিংহ',
};

// Bengali mapping for districts
const DISTRICT_BN_MAP: Record<string, string> = {
  Dhaka: 'ঢাকা',
  Gazipur: 'গাজীপুর',
  Narayanganj: 'নারায়ণগঞ্জ',
  Narsingdi: 'নরসিংদী',
  Munshiganj: 'মুন্সীগঞ্জ',
  Manikganj: 'মানিকগঞ্জ',
  Tangail: 'টাঙ্গাইল',
  Faridpur: 'ফরিদপুর',
  Gopalganj: 'গোপালগঞ্জ',
  Madaripur: 'মাদারীপুর',
  Rajbari: 'রাজবাড়ী',
  Shariatpur: 'শরীয়তপুর',
  Kishoreganj: 'কিশোরগঞ্জ',
  Chattogram: 'চট্টগ্রাম',
  "Cox's Bazar": 'কক্সবাজার',
  Cumilla: 'কুমিল্লা',
  Brahmanbaria: 'ব্রাহ্মণবাড়িয়া',
  Chandpur: 'চাঁদপুর',
  Feni: 'ফেনী',
  Lakshmipur: 'লক্ষ্মীপুর',
  Noakhali: 'নোয়াখালী',
  Khagrachhari: 'খাগড়াছড়ি',
  Rangamati: 'রাঙ্গামাটি',
  Bandarban: 'বান্দরবান',
  Rajshahi: 'রাজশাহী',
  Bogura: 'বগুড়া',
  Joypurhat: 'জয়পুরহাট',
  Naogaon: 'নওগাঁ',
  Natore: 'নাটোর',
  Nawabganj: 'চাঁপাইনবাবগঞ্জ',
  Pabna: 'পাবনা',
  Sirajganj: 'সিরাজগঞ্জ',
  Khulna: 'খুলনা',
  Bagerhat: 'বাগেরহাট',
  Satkhira: 'সাতক্ষীরা',
  Jessore: 'যশোর',
  Magura: 'মাগুরা',
  Narail: 'নড়াইল',
  Jhenaidah: 'ঝিনাইদহ',
  Kushtia: 'কুষ্টিয়া',
  Chuadanga: 'চুয়াডাঙ্গা',
  Meherpur: 'মেহেরপুর',
  Barishal: 'বরিশাল',
  Bhola: 'ভোলা',
  Jhalokati: 'ঝালকাঠি',
  Patuakhali: 'পটুয়াখালী',
  Pirojpur: 'পিরোজপুর',
  Barguna: 'বরগুনা',
  Sylhet: 'সিলেট',
  Moulvibazar: 'মৌলভীবাজার',
  Habiganj: 'হবিগঞ্জ',
  Sunamganj: 'সুনামগঞ্জ',
  Rangpur: 'রংপুর',
  Dinajpur: 'দিনাজপুর',
  Gaibandha: 'গাইবান্ধা',
  Kurigram: 'কুড়িগ্রাম',
  Lalmonirhat: 'লালমনিরহাট',
  Nilphamari: 'নীলফামারী',
  Panchagarh: 'পঞ্চগড়',
  Thakurgaon: 'ঠাকুরগাঁও',
  Mymensingh: 'ময়মনসিংহ',
  Jamalpur: 'জামালপুর',
  Netrokona: 'নেত্রকোণা',
  Sherpur: 'শেরপুর',
};

// Bengali mapping for common upazilas
const UPAZILA_BN_MAP: Record<string, string> = {
  "Dhamrai": "ধামরাই",
  "Dohar": "দোহার",
  "Keraniganj": "কেরানীগঞ্জ",
  "Nawabganj": "নবাবগঞ্জ",
  "Savar": "সাভার",
  "Mirpur": "মিরপুর",
  "Mohammadpur": "মহম্মদপুর",
  "Dhanmondi": "ধানমন্ডি",
  "Lalbagh": "লালবাগ",
  "Kotwali": "কোতোয়ালি",
  "Sutrapur": "সূত্রাপুর",
  "Gulshan": "গুলশান",
  "Demra": "ডেমরা",
  "Tejgaon": "তেজগাঁও",
  "Ramna": "রমনা",
  "Motijheel": "মতিঝিল",
  "Cantonment": "ক্যান্টনমেন্ট",
  "Khilgaon": "খিলগাঁও",
  "Badda": "বাড্ডা",
  "Uttara": "উত্তরা",
  "Gazipur Sadar": "গাজীপুর সদর",
  "Kaliakair": "কালিয়াকৈর",
  "Kaliganj": "কালীগঞ্জ",
  "Kapasia": "কাপাসিয়া",
  "Sreepur": "শ্রীপুর",
  "Araihazar": "আড়াইহাজার",
  "Bandar": "বন্দর",
  "Narayanganj Sadar": "নারায়ণগঞ্জ সদর",
  "Rupganj": "রূপগঞ্জ",
  "Sonargaon": "সোনারগাঁও",
  "Narsingdi Sadar": "নরসিংদী সদর",
  "Belabo": "বেলাবো",
  "Monohardi": "মনোহরদী",
  "Palash": "পলাশ",
  "Raipura": "রায়পুরা",
  "Shibpur": "শিবপুর",
  "Munshiganj Sadar": "মুন্সীগঞ্জ সদর",
  "Gazaria": "গজারিয়া",
  "Tongibari": "টংগিবাড়ী",
  "Lauhajang": "লৌহজং",
  "Srinagar": "শ্রীনগর",
  "Sirajdikhan": "সিরাজদিখান",
  "Manikganj Sadar": "মানিকগঞ্জ সদর",
  "Singair": "সিংগাইর",
  "Shibalaya": "শিবালয়",
  "Saturia": "সাটুরিয়া",
  "Harirampur": "হরিরামপুর",
  "Gheor": "ঘিওর",
  "Daulatpur": "দৌলতপুর",
  "Tangail Sadar": "টাঙ্গাইল সদর",
  "Sakhipur": "সখীপুর",
  "Basail": "বাসাইল",
  "Madhupur": "মধুপুর",
  "Ghatail": "ঘাটাইল",
  "Kalihati": "কালিহাতী",
  "Nagarpur": "নাগরপুর",
  "Mirzapur": "মির্জাপুর",
  "Gopalpur": "গোপালপুর",
  "Delduar": "দেলদুয়ার",
  "Bhuapur": "ভূঞাপুর",
  "Dhanbari": "ধনবাড়ী",
  "Faridpur Sadar": "ফরিদপুর সদর",
  "Boalmari": "বোয়ালমারী",
  "Alfadanga": "আলফাডাঙ্গা",
  "Madhukhali": "মধুখালী",
  "Bhanga": "ভাঙ্গা",
  "Nagarkanda": "নগরকান্দা",
  "Charbhadrasan": "চরভদ্রাসন",
  "Sadarpur": "সদরপুর",
  "Saltha": "সালথা",
  "Gopalganj Sadar": "গোপালগঞ্জ সদর",
  "Kashiani": "কাশিয়ানী",
  "Kotalipara": "কোটালীপাড়া",
  "Muksudpur": "মুকসুদপুর",
  "Tungipara": "টুঙ্গিপাড়া",
  "Madaripur Sadar": "মাদারীপুর সদর",
  "Kalkini": "কালকিনি",
  "Rajoir": "রাজৈর",
  "Shibchar": "শিবচর",
  "Dasar": "ডাসার",
  "Rajbari Sadar": "রাজবাড়ী সদর",
  "Goalanda": "গোয়ালন্দ",
  "Pangsa": "পাংশা",
  "Baliakandi": "বালিয়াকান্দি",
  "Kalukhali": "কালুখালী",
  "Shariatpur Sadar": "শরীয়তপুর সদর",
  "Damudya": "ডামুড্যা",
  "Naria": "নড়িয়া",
  "Zajira": "জাজিরা",
  "Gosairhat": "গোসাইরহাট",
  "Bhedarganj": "ভেদরগঞ্জ",
  "Kishoreganj Sadar": "কিশোরগঞ্জ সদর",
  "Hossainpur": "হোসেনপুর",
  "Karimganj": "করিমগঞ্জ",
  "Tarail": "তাড়াইল",
  "Bajitpur": "বাজিতপুর",
  "Kuliarchar": "কুলিয়ারচর",
  "Bhairab": "ভৈরব",
  "Nikli": "নিকলী",
  "Itna": "ইটনা",
  "Mithamain": "মিঠামইন",
  "Austagram": "অষ্টগ্রাম",
  "Pakundia": "পাকুন্দিয়া",
  "Katiadi": "কটিয়াদী",
  "Anwara": "আনোয়ারা",
  "Banshkhali": "বাঁশখালী",
  "Boalkhali": "বোয়ালখালী",
  "Chandanaish": "চন্দনাইশ",
  "Chandananish": "চন্দনাইশ",
  "Fatikchhari": "ফটিকছড়ি",
  "Hathazari": "হাটহাজারী",
  "Lohagara": "লোহাগাড়া",
  "Mirsharai": "মীরসরাই",
  "Patiya": "পটিয়া",
  "Rangunia": "রাঙ্গুনিয়া",
  "Raozan": "রাউজান",
  "Sandwip": "সন্দ্বীপ",
  "Satkania": "সাতকানিয়া",
  "Sitakunda": "সীতাকুণ্ড",
  "Karnafuli": "কর্ণফুলী",
  "Cox's Bazar Sadar": "কক্সবাজার সদর",
  "Chakaria": "চকরিয়া",
  "Maheshkhali": "মহেশখালী",
  "Ramu": "রামু",
  "Ramus": "রামু",
  "Eidgaon": "ঈদগাঁও",
  "Teknaf": "টেকনাফ",
  "Ukhia": "উখিয়া",
  "Pekua": "পেকুয়া",
  "Kutubdia": "কুতুবদিয়া",
  "Cumilla Sadar": "কুমিল্লা সদর",
  "Barura": "বরুড়া",
  "Brahmanpara": "ব্রাহ্মণপাড়া",
  "Burichang": "বুড়িচং",
  "Chandina": "চান্দিনা",
  "Chauddagram": "চৌদ্দগ্রাম",
  "Daudkandi": "দাউদকান্দি",
  "Debidwar": "দেবীদ্বার",
  "Homna": "হোমনা",
  "Laksam": "লাকসাম",
  "Muradnagar": "মুরাদনগর",
  "Nangalkot": "নাঙ্গলকোট",
  "Titas": "তিতাস",
  "Meghna": "মেঘনা",
  "Monohargonj": "মনোহরগঞ্জ",
  "Sadarsouth": "সদর দক্ষিণ",
  "Lalmai": "লালমাই",
  "Brahmanbaria Sadar": "ব্রাহ্মণবাড়িয়া সদর",
  "Ashuganj": "আশুগঞ্জ",
  "Nasirnagar": "নাসিরনগর",
  "Nabinagar": "নবীনগর",
  "Sarail": "সরাইল",
  "Kasba": "কসবা",
  "Akhaura": "আখাউড়া",
  "Bancharampur": "বাঞ্ছারামপুর",
  "Bijoynagar": "বিজয়নগর",
  "Chandpur Sadar": "চাঁদপুর সদর",
  "Faridganj": "ফরিদগঞ্জ",
  "Haimchar": "হাইমচর",
  "Haziganj": "হাজীগঞ্জ",
  "Hajiganj": "হাজীগঞ্জ",
  "Kachua": "কচুয়া",
  "Matlab North": "মতলব উত্তর",
  "Matlab South": "মতলব দক্ষিণ",
  "Shahrasti": "শাহরাস্তি",
  "Feni Sadar": "ফেনী সদর",
  "Daganbhuiyan": "দাগনভূঞা",
  "Chhagalnaiya": "ছাগলনাইয়া",
  "Sonagazi": "সোনাগাজী",
  "Parshuram": "পরশুরাম",
  "Fulgazi": "ফুলগাজী",
  "Lakshmipur Sadar": "লক্ষ্মীপুর সদর",
  "Raipur": "রায়পুর",
  "Ramganj": "রামগঞ্জ",
  "Ramgati": "রামগতি",
  "Kamalnagar": "কমলনগর",
  "Noakhali Sadar": "নোয়াখালী সদর",
  "Begumganj": "বেগমগঞ্জ",
  "Chatkhil": "চাটখিল",
  "Senbagh": "সেনবাগ",
  "Companiganj": "কোম্পানীগঞ্জ",
  "Hatiya": "হাতিয়া",
  "Kabirhat": "কবিরহাট",
  "Sonaimuri": "সোনাইমুড়ী",
  "Subarnachar": "সুবর্ণচর",
  "Khagrachhari Sadar": "খাগড়াছড়ি সদর",
  "Dighinala": "দিঘীনালা",
  "Panchhari": "পানছড়ি",
  "Laxmichhari": "লক্ষ্মীছড়ি",
  "Mahalchhari": "মহালছড়ি",
  "Manikchhari": "মানিকছড়ি",
  "Ramgarh": "রামগড়",
  "Matiranga": "মাটিরাঙ্গা",
  "Guimara": "গুইমারা",
  "Rangamati Sadar": "রাঙ্গামাটি সদর",
  "Bagaichhari": "বাঘাইছড়ি",
  "Barkal": "বরকল",
  "Langadu": "লংগদু",
  "Rajasthali": "রাজস্থলী",
  "Kaptai": "কাপ্তাই",
  "Juraichhari": "জুরাইছড়ি",
  "Naniarchar": "নানিয়ারচর",
  "Belaichhari": "বিলাইছড়ি",
  "Kawkhali": "কাউখালী",
  "Bandarban Sadar": "বান্দরবান সদর",
  "Thanchi": "থানচি",
  "Lama": "লামা",
  "Naikhongchhari": "নাইক্ষ্যংছড়ি",
  "Ali Kadam": "আলীকদম",
  "Rowangchhari": "রোয়াংছড়ি",
  "Ruma": "রুমা",
  "Paba": "পবা",
  "Godagari": "গোদাগাড়ী",
  "Tanore": "তানোর",
  "Mohanpur": "মোহনপুর",
  "Bagmara": "বাগমারা",
  "Durgapur": "দুর্গাপুর",
  "Puthia": "পুঠিয়া",
  "Charghat": "চারঘাট",
  "Bagha": "বাঘা",
  "Bogura Sadar": "বগুড়া সদর",
  "Sherpur": "শেরপুর",
  "Sariakandi": "সারিয়াকান্দি",
  "Shajahanpur": "শাজাহানপুর",
  "Kahaloo": "কাহালু",
  "Dhunat": "ধুনট",
  "Adamdighi": "আদমদীঘি",
  "Nandigram": "নন্দীগ্রাম",
  "Sonatala": "সোনাতলা",
  "Sonavatala": "সোনাতলা",
  "Shibganj": "শিবগঞ্জ",
  "Gabtoli": "গাবতলী",
  "Dupchanchia": "দুপচাঁচিয়া",
  "Joypurhat Sadar": "জয়পুরহাট সদর",
  "Panchbibi": "পাঁচবিবি",
  "Akkelpur": "আক্কেলপুর",
  "Kalai": "কালাই",
  "Khetlal": "ক্ষেতলাল",
  "Naogaon Sadar": "নওগাঁ সদর",
  "Mohadevpur": "মহাদেবপুর",
  "Manda": "মান্দা",
  "Niamatpur": "নিয়ামতপুর",
  "Atrai": "আত্রাই",
  "Raninagar": "রাণীনগর",
  "Patnitala": "পত্নীতলা",
  "Dhamoirhat": "ধামইরহাট",
  "Sapahar": "সাপাহার",
  "Porsha": "পোরশা",
  "Badalgachhi": "বদলগাছী",
  "Natore Sadar": "নাটোর সদর",
  "Singra": "সিংড়া",
  "Baraigram": "বড়াইগ্রাম",
  "Bagatipara": "বাগাতিপাড়া",
  "Lalpur": "লালপুর",
  "Gurudaspur": "গুরুদাসপুর",
  "Naldanga": "নলডাঙ্গা",
  "Chapainawabganj Sadar": "চাঁপাইনবাবগঞ্জ সদর",
  "Gomostapur": "গোমস্তাপুর",
  "Gomastapur": "গোমস্তাপুর",
  "Nachole": "নাচোল",
  "Bholahat": "ভোলাহাট",
  "Pabna Sadar": "পাবনা সদর",
  "Atgharia": "আটঘরিয়া",
  "Ishwardi": "ঈশ্বরদী",
  "Chatmohar": "চাটমোহর",
  "Bera": "বেড়া",
  "Santhia": "সাঁথিয়া",
  "Sujanagar": "সুজানগর",
  "Bhangura": "ভাঙ্গুড়া",
  "Sirajganj Sadar": "সিরাজগঞ্জ সদর",
  "Kazipur": "কাজীপুর",
  "Ullahpara": "উল্লাপাড়া",
  "Shahjadpur": "শাহজাদপুর",
  "Raiganj": "রায়গঞ্জ",
  "Tarash": "তাড়াশ",
  "Belkuchi": "বেলকুচি",
  "Kamarkhanda": "কামারখন্দ",
  "Chauhali": "চৌহালী",
  "Khulna Sadar": "খুলনা সদর",
  "Dighalia": "দিঘলিয়া",
  "Koyra": "কয়রা",
  "Dacope": "দাকোপ",
  "Dumuria": "ডুমুরিয়া",
  "Paikgachha": "পাইকগাছা",
  "Phultala": "ফুলতলা",
  "Rupsha": "রূপসা",
  "Terokhada": "তেরখাদা",
  "Batiaghata": "বটিয়াঘাটা",
  "Bagerhat Sadar": "বাগেরহাট সদর",
  "Chitalmari": "চিতলমারী",
  "Fakirhat": "ফকিরহাট",
  "Mollahat": "মোল্লাহাট",
  "Mongla": "মোংলা",
  "Morrelganj": "মোড়েলগঞ্জ",
  "Rampal": "রামপাল",
  "Sarankhola": "শরণখোলা",
  "Satkhira Sadar": "সাতক্ষীরা সদর",
  "Assasuni": "আশাশুনি",
  "Debhata": "দেবহাটা",
  "Kalaroa": "কলারোয়া",
  "Shyamnagar": "শ্যামনগর",
  "Tala": "তালা",
  "Jessore Sadar": "যশোর সদর",
  "Abhaynagar": "অভয়নগর",
  "Bagherpara": "বাঘারপাড়া",
  "Chougachha": "চৌগাছা",
  "Jhikargachha": "ঝিকরগাছা",
  "Keshabpur": "কেশবপুর",
  "Manirampur": "মণিরামপুর",
  "Sharsha": "শার্শা",
  "Magura Sadar": "মাগুরা সদর",
  "Shalikha": "শালিখা",
  "Narail Sadar": "নড়াইল সদর",
  "Kalia": "কালিয়া",
  "Jhenaidah Sadar": "ঝিনাইদহ সদর",
  "Sailkupa": "শৈলকূপা",
  "Harinakunda": "হরিণাকুণ্ডু",
  "Kotchandpur": "কোটচাঁদপুর",
  "Moheshpur": "মহেশপুর",
  "Kushtia Sadar": "কুষ্টিয়া সদর",
  "Kumarkhali": "কুমারখালী",
  "Khoksa": "খোকসা",
  "Bheramara": "ভেড়ামারা",
  "Chuadanga Sadar": "চুয়াডাঙ্গা সদর",
  "Alamdanga": "আলমডাঙ্গা",
  "Damurhuda": "দামুড়হুদা",
  "Jibannagar": "জীবননগর",
  "Meherpur Sadar": "মেহেরপুর সদর",
  "Gangni": "গাংনী",
  "Mujibnagar": "মুজিবনগর",
  "Barishal Sadar": "বরিশাল সদর",
  "Bakerganj": "বাকেরগঞ্জ",
  "Babuganj": "বাবুগঞ্জ",
  "Wazirpur": "উজিরপুর",
  "Banaripara": "বানারীপাড়া",
  "Gournadi": "গৌরনদী",
  "Agailjhara": "আগৈলঝাড়া",
  "Mehendiganj": "মেহেন্দীগঞ্জ",
  "Muladi": "মুলাদী",
  "Hizla": "হিজলা",
  "Bhola Sadar": "ভোলা সদর",
  "Burhanuddin": "বোরহানউদ্দিন",
  "Char Fasson": "চরফ্যাশন",
  "Daulatkhan": "দৌলতখান",
  "Lalmohan": "লালমোহন",
  "Manpura": "মনপুরা",
  "Tazumuddin": "তজুমদ্দিন",
  "Jhalokati Sadar": "ঝালকাঠি সদর",
  "Kathalia": "কাঠালিয়া",
  "Nalchity": "নলছিটি",
  "Rajapur": "রাজাপুর",
  "Patuakhali Sadar": "পটুয়াখালী সদর",
  "Pabna Patuakhali Sadar": "পটুয়াখালী সদর",
  "Bauphal": "বাউফল",
  "Dashmina": "দশমিনা",
  "Galachipa": "গলাচিপা",
  "Kalapara": "কলাপাড়া",
  "Mirzaganj": "মির্জাগঞ্জ",
  "Dumki": "দুমকী",
  "Rangabali": "রাঙ্গাবালী",
  "Pirojpur Sadar": "পিরোজপুর সদর",
  "Bhandaria": "ভান্ডারিয়া",
  "Mathbaria": "মঠবাড়িয়া",
  "Nazirpur": "নাজিরপুর",
  "Nesarabad": "নেছারাবাদ",
  "Zianagar": "জিয়ানগর",
  "Barguna Sadar": "বরগুনা সদর",
  "Amtali": "আমতলী",
  "Bamna": "বামনা",
  "Betagi": "বেতাগী",
  "Patharghata": "পাথরঘাটা",
  "Taltali": "তালতলী",
  "Beanibazar": "বিয়ানীবাজার",
  "Sylhet Sadar": "সিলেট সদর",
  "Bishwanath": "বিশ্বনাথ",
  "Fenchuganj": "ফেঞ্চুগঞ্জ",
  "Golapganj": "গোলাপগঞ্জ",
  "Gowainghat": "গোয়াইনঘাট",
  "Jaintiapur": "জৈন্তাপুর",
  "Kanaighat": "কানাইঘাট",
  "Zakiganj": "জকিগঞ্জ",
  "Dakshin Surma": "দক্ষিণ সুরমা",
  "Osmaninagar": "ওসমানীনগর",
  "Moulvibazar Sadar": "মৌলভীবাজার সদর",
  "Barlekha": "বড়লেখা",
  "Juri": "জুড়ী",
  "Kamalganj": "কমলগঞ্জ",
  "Kulaura": "কুলাউড়া",
  "Rajnagar": "রাজনগর",
  "Sreemangal": "শ্রীমঙ্গল",
  "Habiganj Sadar": "হবিগঞ্জ সদর",
  "Bahubal": "বাহুবল",
  "Baniyachong": "বানিয়াচং",
  "Chunarughat": "চুনারুঘাট",
  "Ajmiriganj": "আজমিরীগঞ্জ",
  "Madhabpur": "মাধবপুর",
  "Nabiganj": "নবীগঞ্জ",
  "Lakhai": "লাখাই",
  "Shayestaganj": "শায়েস্তাগঞ্জ",
  "Sunamganj Sadar": "সুনামগঞ্জ সদর",
  "South Sunamganj": "দক্ষিণ সুনামগঞ্জ",
  "Bishwamandarpur": "বিশ্বম্ভরপুর",
  "Chhatak": "ছাতক",
  "Derai": "দিরাই",
  "Dharampasha": "ধর্মপাশা",
  "Dowarabazar": "দোয়ারাবাজার",
  "Jagannathpur": "জগন্নাথপুর",
  "Jamalganj": "জামালগঞ্জ",
  "Sullah": "শাল্লা",
  "Tahirpur": "তাহিরপুর",
  "Shantiganj": "শান্তিগঞ্জ",
  "Madhyanagar": "মধ্যনগর",
  "Rangpur Sadar": "রংপুর সদর",
  "Badarganj": "বদরগঞ্জ",
  "Gangachhara": "গঙ্গাচড়া",
  "Gangachara": "গঙ্গাচড়া",
  "Kaunia": "কাউনিয়া",
  "Mithapukur": "মিঠাপুকুর",
  "Pirgachha": "পীরগাছা",
  "Pirganj": "পীরগঞ্জ",
  "Taraganj": "তারাগঞ্জ",
  "Dinajpur Sadar": "দিনাজপুর সদর",
  "Birganj": "বীরগঞ্জ",
  "Biral": "বিরল",
  "Bochaganj": "বোচাগঞ্জ",
  "Kaharole": "কাহারোল",
  "Fulbari": "ফুলবাড়ী",
  "Phulbari": "ফুলবাড়ী",
  "Ghoraghat": "ঘোড়াঘাট",
  "Hakimpur": "হাকিমপুর",
  "Chirirbandar": "চিরিরবন্দর",
  "Biampur": "বিরামপুর",
  "Khansama": "খানসামা",
  "Khanshama": "খানসামা",
  "Parbatipur": "পার্বতীপুর",
  "Gaibandha Sadar": "গাইবান্ধা সদর",
  "Fulchhari": "ফুলছড়ি",
  "Phulchhari": "ফুলছড়ি",
  "Gobindaganj": "গোবিন্দগঞ্জ",
  "Palashbari": "পলাশবাড়ী",
  "Sadullapur": "সাদুল্লাপুর",
  "Saghatta": "সাঘাটা",
  "Saghata": "সাঘাটা",
  "Sundarganj": "সুন্দরগঞ্জ",
  "Kurigram Sadar": "কুড়িগ্রাম সদর",
  "Nageshwari": "নাগেশ্বরী",
  "Bhurungamari": "ভুরুঙ্গামারী",
  "Rajarhat": "রাজারহাট",
  "Rhumari": "রৌমারী",
  "Chilmari": "চিলমারী",
  "Ulipur": "উলিপুর",
  "Char Rajibpur": "চর রাজিবপুর",
  "Lalmonirhat Sadar": "লালমনিরহাট সদর",
  "Aditmari": "আদিতমারী",
  "Hatibandha": "হাতীবান্ধা",
  "Patgram": "পাটগ্রাম",
  "Nilphamari Sadar": "নীলফামারী সদর",
  "Saidpur": "সৈয়দপুর",
  "Jaldhaka": "জলঢাকা",
  "Domar": "ডোমার",
  "Dimla": "ডিমলা",
  "Panchagarh Sadar": "পঞ্চগড় সদর",
  "Pachagarh Sadar": "পঞ্চগড় সদর",
  "Boda": "বোদা",
  "Debiganj": "দেবীগঞ্জ",
  "Atwari": "আটোয়ারী",
  "Tentulia": "তেঁতুলিয়া",
  "Thakurgaon Sadar": "ঠাকুরগাঁও সদর",
  "Baliadangi": "বালিয়াডাঙ্গী",
  "Haripur": "হরিপুর",
  "Ranisankail": "রাণীশংকৈল",
  "Mymensingh Sadar": "ময়মনসিংহ সদর",
  "Muktagachha": "মুক্তাগাছা",
  "Fulbaria": "ফুলবাড়ীয়া",
  "Trishal": "ত্রিশাল",
  "Bhaluka": "ভালুকা",
  "Gaffargaon": "গফরগাঁও",
  "Nandail": "নান্দাইল",
  "Ishwarganj": "ঈশ্বরগঞ্জ",
  "Haluaghat": "হালুয়াঘাট",
  "Dhobaura": "ধোবাউড়া",
  "Phulpur": "ফুলপুর",
  "Tarakanda": "তারাকান্দা",
  "TaraKanda": "তারাকান্দা",
  "Jamalpur Sadar": "জামালপুর সদর",
  "Mymensingh Jamalpur Sadar": "জামালপুর সদর",
  "Baksiganj": "বকশীগঞ্জ",
  "Bakshiganj": "বকশীগঞ্জ",
  "Dewanganj": "দেওয়ানগঞ্জ",
  "Islampur": "ইসলামপুর",
  "Isampur": "ইসলামপুর",
  "Madarganj": "মাদারগঞ্জ",
  "Melandaha": "মেলান্দহ",
  "Sarishabari": "সরিষাবাড়ী",
  "Netrokona Sadar": "নেত্রকোণা সদর",
  "Barhatta": "বারহাট্টা",
  "Khaliajuri": "খালিয়াজুরী",
  "Kalmakanda": "কলমাকান্দা",
  "Kendua": "কেন্দুয়া",
  "Madan": "মদন",
  "Mohanganj": "মোহনগঞ্জ",
  "Purbadhala": "পূর্বধলা",
  "Atpara": "আটপাড়া",
  "Sherpur Sadar": "শেরপুর সদর",
  "Nalitabari": "নালিতাবাড়ী",
  "Sreebardi": "শ্রীবরদী",
  "Karhaibar": "ঝিনাইগাতী",
  "Jhenaigati": "ঝিনাইগাতী",
  "Faridpur": "ফরিদপুর",
  "Kishoreganj": "কিশোরগঞ্জ"
};

// Raw CSV text as provided by the user
export const RAW_UPAZILA_CSV = `Division (বিভাগ),District (জেলা),Upazila (উপজেলা),Defult ID
Dhaka,Dhaka,Dhamrai,Dha001
Dhaka,Dhaka,Dohar,Doh002
Dhaka,Dhaka,Keraniganj,Ker003
Dhaka,Dhaka,Nawabganj,Naw004
Dhaka,Dhaka,Savar,Sav005
Dhaka,Dhaka,Mirpur,Mir006
Dhaka,Dhaka,Mohammadpur,Moh007
Dhaka,Dhaka,Dhanmondi,Dha008
Dhaka,Dhaka,Lalbagh,Lal009
Dhaka,Dhaka,Kotwali,Kot010
Dhaka,Dhaka,Sutrapur,Sut011
Dhaka,Dhaka,Gulshan,Gul012
Dhaka,Dhaka,Demra,Dem013
Dhaka,Dhaka,Tejgaon,Tej014
Dhaka,Dhaka,Ramna,Ram015
Dhaka,Dhaka,Motijheel,Mot016
Dhaka,Dhaka,Cantonment,Can017
Dhaka,Dhaka,Khilgaon,Khi018
Dhaka,Dhaka,Badda,Bad019
Dhaka,Dhaka,Uttara,Utt020
Dhaka,Gazipur,Gazipur Sadar,Gaz001
Dhaka,Gazipur,Kaliakair,Kal002
Dhaka,Gazipur,Kaliganj,Kal003
Dhaka,Gazipur,Kapasia,Kap004
Dhaka,Gazipur,Sreepur,Sre005
Dhaka,Narayanganj,Araihazar,Ara001
Dhaka,Narayanganj,Bandar,Ban002
Dhaka,Narayanganj,Narayanganj Sadar,Nar003
Dhaka,Narayanganj,Rupganj,Rup004
Dhaka,Narayanganj,Sonargaon,Son005
Dhaka,Narsingdi,Narsingdi Sadar,Nar001
Dhaka,Narsingdi,Belabo,Bel002
Dhaka,Narsingdi,Monohardi,Mon003
Dhaka,Narsingdi,Palash,Pal004
Dhaka,Narsingdi,Raipura,Rai005
Dhaka,Narsingdi,Shibpur,Shi006
Dhaka,Munshiganj,Munshiganj Sadar,Mun001
Dhaka,Munshiganj,Gazaria,Gaz002
Dhaka,Munshiganj,Tongibari,Ton003
Dhaka,Munshiganj,Lauhajang,Lau004
Dhaka,Munshiganj,Srinagar,Sri005
Dhaka,Munshiganj,Sirajdikhan,Sir006
Dhaka,Manikganj,Manikganj Sadar,Man001
Dhaka,Manikganj,Singair,Sin002
Dhaka,Manikganj,Shibalaya,Shi003
Dhaka,Manikganj,Saturia,Sat004
Dhaka,Manikganj,Harirampur,Har005
Dhaka,Manikganj,Gheor,Ghe006
Dhaka,Manikganj,Daulatpur,Dau007
Dhaka,Tangail,Tangail Sadar,Tan001
Dhaka,Tangail,Sakhipur,Sak002
Dhaka,Tangail,Basail,Bas003
Dhaka,Tangail,Madhupur,Mad004
Dhaka,Tangail,Ghatail,Gha005
Dhaka,Tangail,Kalihati,Kal006
Dhaka,Tangail,Nagarpur,Nag007
Dhaka,Tangail,Mirzapur,Mir008
Dhaka,Tangail,Gopalpur,Gop009
Dhaka,Tangail,Delduar,Del010
Dhaka,Tangail,Bhuapur,Bhu011
Dhaka,Tangail,Dhanbari,Dha012
Dhaka,Faridpur,Faridpur Sadar,Far001
Dhaka,Faridpur,Boalmari,Boa002
Dhaka,Faridpur,Alfadanga,Alf003
Dhaka,Faridpur,Madhukhali,Mad004
Dhaka,Faridpur,Bhanga,Bha005
Dhaka,Faridpur,Nagarkanda,Nag006
Dhaka,Faridpur,Charbhadrasan,Cha007
Dhaka,Faridpur,Sadarpur,Sad008
Dhaka,Faridpur,Saltha,Sal009
Dhaka,Gopalganj,Gopalganj Sadar,Gop001
Dhaka,Gopalganj,Kashiani,Kas002
Dhaka,Gopalganj,Kotalipara,Kot003
Dhaka,Gopalganj,Muksudpur,Muk004
Dhaka,Gopalganj,Tungipara,Tun005
Dhaka,Madaripur,Madaripur Sadar,Mad001
Dhaka,Madaripur,Kalkini,Kal002
Dhaka,Madaripur,Rajoir,Raj003
Dhaka,Madaripur,Shibchar,Shi004
Dhaka,Madaripur,Dasar,Das005
Dhaka,Rajbari,Rajbari Sadar,Raj001
Dhaka,Rajbari,Goalanda,Goa002
Dhaka,Rajbari,Pangsa,Pan003
Dhaka,Rajbari,Baliakandi,Bal004
Dhaka,Rajbari,Kalukhali,Kal005
Dhaka,Shariatpur,Shariatpur Sadar,Sha001
Dhaka,Shariatpur,Damudya,Dam002
Dhaka,Shariatpur,Naria,Nar003
Dhaka,Shariatpur,Zajira,Zaj004
Dhaka,Shariatpur,Gosairhat,Gos005
Dhaka,Shariatpur,Bhedarganj,Bhe006
Dhaka,Kishoreganj,Kishoreganj Sadar,Kis001
Dhaka,Kishoreganj,Hossainpur,Hos002
Dhaka,Kishoreganj,Karimganj,Kar003
Dhaka,Kishoreganj,Tarail,Tar004
Dhaka,Kishoreganj,Bajitpur,Baj005
Dhaka,Kishoreganj,Kuliarchar,Kul006
Dhaka,Kishoreganj,Bhairab,Bha007
Dhaka,Kishoreganj,Nikli,Nik008
Dhaka,Kishoreganj,Itna,Itn009
Dhaka,Kishoreganj,Mithamain,Mit010
Dhaka,Kishoreganj,Austagram,Aus011
Dhaka,Kishoreganj,Pakundia,Pak012
Dhaka,Kishoreganj,Katiadi,Kat013
Chattogram,Chattogram,Anwara,Anw001
Chattogram,Chattogram,Banshkhali,Ban002
Chattogram,Chattogram,Boalkhali,Boa003
Chattogram,Chattogram,Chandananish,Cha004
Chattogram,Chattogram,Fatikchhari,Fat005
Chattogram,Chattogram,Hathazari,Hat006
Chattogram,Chattogram,Lohagara,Loh007
Chattogram,Chattogram,Mirsharai,Mir008
Chattogram,Chattogram,Patiya,Pat009
Chattogram,Chattogram,Rangunia,Ran010
Chattogram,Chattogram,Raozan,Rao011
Chattogram,Chattogram,Sandwip,San012
Chattogram,Chattogram,Satkania,Sat013
Chattogram,Chattogram,Sitakunda,Sit014
Chattogram,Chattogram,Karnafuli,Kar015
Chattogram,Cox's Bazar,Cox's Bazar Sadar,Cox001
Chattogram,Cox's Bazar,Chakaria,Cha002
Chattogram,Cox's Bazar,Maheshkhali,Mah003
Chattogram,Cox's Bazar,Ramus,Ram004
Chattogram,Cox's Bazar,Teknaf,Tek005
Chattogram,Cox's Bazar,Ukhia,Ukh006
Chattogram,Cox's Bazar,Pekua,Pek007
Chattogram,Cox's Bazar,Eidgaon,Eid008
Chattogram,Cumilla,Cumilla Sadar,Cum001
Chattogram,Cumilla,Barura,Bar002
Chattogram,Cumilla,Brahmanpara,Bra003
Chattogram,Cumilla,Burichang,Bur004
Chattogram,Cumilla,Chandina,Cha005
Chattogram,Cumilla,Chauddagram,Cha006
Chattogram,Cumilla,Daudkandi,Dau007
Chattogram,Cumilla,Debidwar,Deb008
Chattogram,Cumilla,Homna,Hom009
Chattogram,Cumilla,Laksam,Lak010
Chattogram,Cumilla,Muradnagar,Mur011
Chattogram,Cumilla,Nangalkot,Nan012
Chattogram,Cumilla,Titas,Tit013
Chattogram,Cumilla,Meghna,Meg014
Chattogram,Cumilla,Monohargonj,Mon015
Chattogram,Cumilla,Sadarsouth,Sad016
Chattogram,Cumilla,Lalmai,Lal017
Chattogram,Brahmanbaria,Brahmanbaria Sadar,Bra001
Chattogram,Brahmanbaria,Ashuganj,Ash002
Chattogram,Brahmanbaria,Nasirnagar,Nas003
Chattogram,Brahmanbaria,Nabinagar,Nab004
Chattogram,Brahmanbaria,Sarail,Sar005
Chattogram,Brahmanbaria,Kasba,Kas006
Chattogram,Brahmanbaria,Akhaura,Akh007
Chattogram,Brahmanbaria,Bancharampur,Ban008
Chattogram,Brahmanbaria,Bijoynagar,Bij009
Chattogram,Chandpur,Chandpur Sadar,Cha001
Chattogram,Chandpur,Hajiganj,Haj002
Chattogram,Chandpur,Kachua,Kac003
Chattogram,Chandpur,Faridganj,Far004
Chattogram,Chandpur,Matlab North,Mat005
Chattogram,Chandpur,Matlab South,Mat006
Chattogram,Chandpur,Shahrasti,Sha007
Chattogram,Chandpur,Haimchar,Hai008
Chattogram,Feni,Feni Sadar,Fen001
Chattogram,Feni,Daganbhuiyan,Dag002
Chattogram,Feni,Chhagalnaiya,Chh003
Chattogram,Feni,Sonagazi,Son004
Chattogram,Feni,Parshuram,Par005
Chattogram,Feni,Fulgazi,Ful006
Chattogram,Lakshmipur,Lakshmipur Sadar,Lak001
Chattogram,Lakshmipur,Raipur,Rai002
Chattogram,Lakshmipur,Ramganj,Ram003
Chattogram,Lakshmipur,Ramgati,Ram004
Chattogram,Lakshmipur,Kamalnagar,Kam005
Chattogram,Noakhali,Noakhali Sadar,Noa001
Chattogram,Noakhali,Begumganj,Beg002
Chattogram,Noakhali,Chatkhil,Cha003
Chattogram,Noakhali,Senbagh,Sen004
Chattogram,Noakhali,Companiganj,Com005
Chattogram,Noakhali,Hatiya,Hat006
Chattogram,Noakhali,Subarnachar,Sub007
Chattogram,Noakhali,Sonaimuri,Son008
Chattogram,Noakhali,Kabirhat,Kab009
Chattogram,Khagrachhari,Khagrachhari Sadar,Kha001
Chattogram,Khagrachhari,Dighinala,Dig002
Chattogram,Khagrachhari,Panchhari,Pan003
Chattogram,Khagrachhari,Laxmichhari,Lax004
Chattogram,Khagrachhari,Mahalchhari,Mah005
Chattogram,Khagrachhari,Manikchhari,Man006
Chattogram,Khagrachhari,Ramgarh,Ram007
Chattogram,Khagrachhari,Matiranga,Mat008
Chattogram,Khagrachhari,Guimara,Gui009
Chattogram,Rangamati,Rangamati Sadar,Ran001
Chattogram,Rangamati,Bagaichhari,Bag002
Chattogram,Rangamati,Barkal,Bar003
Chattogram,Rangamati,Langadu,Lan004
Chattogram,Rangamati,Rajasthali,Raj005
Chattogram,Rangamati,Belaichhari,Bel006
Chattogram,Rangamati,Juraichhari,Jur007
Chattogram,Rangamati,Naniarchar,Nan008
Chattogram,Rangamati,Kaptai,Kap009
Chattogram,Rangamati,Kawkhali,Kaw010
Chattogram,Bandarban,Bandarban Sadar,Ban001
Chattogram,Bandarban,Thanchi,Tha002
Chattogram,Bandarban,Lama,Lam003
Chattogram,Bandarban,Naikhongchhari,Nai004
Chattogram,Bandarban,Ali Kadam,Ali005
Chattogram,Bandarban,Rowangchhari,Row006
Chattogram,Bandarban,Ruma,Rum007
Rajshahi,Rajshahi,Godagari,God001
Rajshahi,Rajshahi,Tanore,Tan002
Rajshahi,Rajshahi,Mohanpur,Moh003
Rajshahi,Rajshahi,Bagmara,Bag004
Rajshahi,Rajshahi,Durgapur,Dur005
Rajshahi,Rajshahi,Puthia,Put006
Rajshahi,Rajshahi,Paba,Pab007
Rajshahi,Rajshahi,Charghat,Cha008
Rajshahi,Rajshahi,Bagha,Bag009
Rajshahi,Bogura,Bogura Sadar,Bog001
Rajshahi,Bogura,Sherpur,She002
Rajshahi,Bogura,Sariakandi,Sar003
Rajshahi,Bogura,Shajahanpur,Sha004
Rajshahi,Bogura,Dupchanchia,Dup005
Rajshahi,Bogura,Adamdighi,Ada006
Rajshahi,Bogura,Kahaloo,Kah007
Rajshahi,Bogura,Nandigram,Nan008
Rajshahi,Bogura,Sonavatala,Son009
Rajshahi,Bogura,Dhunat,Dhu010
Rajshahi,Bogura,Gabtoli,Gab011
Rajshahi,Bogura,Khetlal,Khe012
Rajshahi,Joypurhat,Joypurhat Sadar,Joy001
Rajshahi,Joypurhat,Panchbibi,Pan002
Rajshahi,Joypurhat,Akkelpur,Akk003
Rajshahi,Joypurhat,Kalai,Kal004
Rajshahi,Joypurhat,Khetlal,Khe005
Rajshahi,Naogaon,Naogaon Sadar,Nao001
Rajshahi,Naogaon,Raninagar,Ran002
Rajshahi,Naogaon,Atrai,Atr003
Rajshahi,Naogaon,Badalgachhi,Bad004
Rajshahi,Naogaon,Mohadevpur,Moh005
Rajshahi,Naogaon,Manda,Man006
Rajshahi,Naogaon,Niamatpur,Nia007
Rajshahi,Natore,Natore Sadar,Nat001
Rajshahi,Natore,Baraigram,Bar002
Rajshahi,Natore,Bagatipara,Bag003
Rajshahi,Natore,Lalpur,Lal004
Rajshahi,Natore,Singra,Sin005
Rajshahi,Natore,Gurudaspur,Gur006
Rajshahi,Natore,Naldanga,Nal007
Rajshahi,Nawabganj,Chapainawabganj Sadar,Cha001
Rajshahi,Nawabganj,Gomastapur,Gom002
Rajshahi,Nawabganj,Nachole,Nac003
Rajshahi,Nawabganj,Bholahat,Bho004
Rajshahi,Nawabganj,Shibganj,Shi005
Rajshahi,Pabna,Pabna Sadar,Pab001
Rajshahi,Pabna,Atgharia,Atg002
Rajshahi,Pabna,Ishwardi,Ish003
Rajshahi,Pabna,Chatmohar,Cha004
Rajshahi,Pabna,Faridpur,Far005
Rajshahi,Pabna,Bera,Ber006
Rajshahi,Pabna,Santhia,San007
Rajshahi,Pabna,Sujanagar,Suj008
Rajshahi,Pabna,Bhangura,Bha009
Rajshahi,Sirajganj,Sirajganj Sadar,Sir001
Rajshahi,Sirajganj,Kazipur,Kaz002
Rajshahi,Sirajganj,Ullahpara,Ull003
Rajshahi,Sirajganj,Shahjadpur,Sha004
Rajshahi,Sirajganj,Raiganj,Rai005
Rajshahi,Sirajganj,Tarash,Tar006
Rajshahi,Sirajganj,Belkuchi,Bel007
Rajshahi,Sirajganj,Kamarkhanda,Kam008
Rajshahi,Sirajganj,Chauhali,Cha009
Khulna,Khulna,Khulna Sadar,Khu001
Khulna,Khulna,Dighalia,Dig002
Khulna,Khulna,Rupsha,Rup003
Khulna,Khulna,Terokhada,Ter004
Khulna,Khulna,Dumuria,Dum005
Khulna,Khulna,Batiaghata,Bat006
Khulna,Khulna,Dacope,Dac007
Khulna,Khulna,Paikgachha,Pai008
Khulna,Khulna,Koyra,Koy009
Khulna,Bagerhat,Bagerhat Sadar,Bag001
Khulna,Bagerhat,Chitalmari,Chi002
Khulna,Bagerhat,Fakirhat,Fak003
Khulna,Bagerhat,Kachua,Kac004
Khulna,Bagerhat,Mollahat,Mol005
Khulna,Bagerhat,Mongla,Mon006
Khulna,Bagerhat,Morrelganj,Mor007
Khulna,Bagerhat,Rampal,Ram008
Khulna,Bagerhat,Sarankhola,Sar009
Khulna,Satkhira,Satkhira Sadar,Sat001
Khulna,Satkhira,Assasuni,Ass002
Khulna,Satkhira,Debhata,Deb003
Khulna,Satkhira,Kalaroa,Kal004
Khulna,Satkhira,Kaliganj,Kal005
Khulna,Satkhira,Shyamnagar,Shy006
Khulna,Satkhira,Tala,Tal007
Khulna,Jessore,Jessore Sadar,Jes001
Khulna,Jessore,Abhaynagar,Abh002
Khulna,Jessore,Bagherpara,Bag003
Khulna,Jessore,Chougachha,Cho004
Khulna,Jessore,Jhikargachha,Jhi005
Khulna,Jessore,Keshabpur,Kes006
Khulna,Jessore,Manirampur,Man007
Khulna,Jessore,Sharsha,Sha008
Khulna,Magura,Magura Sadar,Mag001
Khulna,Magura,Mohammadpur,Moh002
Khulna,Magura,Shalikha,Sha003
Khulna,Magura,Sreepur,Sre004
Khulna,Narail,Narail Sadar,Nar001
Khulna,Narail,Kalia,Kal002
Khulna,Narail,Lohagara,Loh003
Khulna,Jhenaidah,Jhenaidah Sadar,Jhe001
Khulna,Jhenaidah,Sailkupa,Sai002
Khulna,Jhenaidah,Harinakunda,Har003
Khulna,Jhenaidah,Kaliganj,Kal004
Khulna,Jhenaidah,Kotchandpur,Kot005
Khulna,Jhenaidah,Moheshpur,Moh006
Khulna,Kushtia,Kushtia Sadar,Kus001
Khulna,Kushtia,Kumarkhali,Kum002
Khulna,Kushtia,Khoksa,Kho003
Khulna,Kushtia,Mirpur,Mir004
Khulna,Kushtia,Daulatpur,Dau005
Khulna,Kushtia,Bheramara,Bhe006
Khulna,Chuadanga,Chuadanga Sadar,Chu001
Khulna,Chuadanga,Alamdanga,Ala002
Khulna,Chuadanga,Damurhuda,Dam003
Khulna,Chuadanga,Jibannagar,Jib004
Khulna,Meherpur,Meherpur Sadar,Meh001
Khulna,Meherpur,Gangni,Gan002
Khulna,Meherpur,Mujibnagar,Muj003
Barishal,Barishal,Barishal Sadar,Bar001
Barishal,Barishal,Bakerganj,Bak002
Barishal,Barishal,Babuganj,Bab003
Barishal,Barishal,Wazirpur,Waz004
Barishal,Barishal,Banaripara,Ban005
Barishal,Barishal,Gournadi,Gou006
Barishal,Barishal,Agailjhara,Aga007
Barishal,Barishal,Mehendiganj,Meh008
Barishal,Barishal,Muladi,Mul009
Barishal,Barishal,Hizla,Hiz010
Barishal,Bhola,Bhola Sadar,Bho001
Barishal,Bhola,Burhanuddin,Bur002
Barishal,Bhola,Char Fasson,Cha003
Barishal,Bhola,Daulatkhan,Dau004
Barishal,Bhola,Lalmohan,Lal005
Barishal,Bhola,Manpura,Man006
Barishal,Bhola,Tazumuddin,Taz007
Barishal,Jhalokati,Jhalokati Sadar,Jha001
Barishal,Jhalokati,Kathalia,Kat002
Barishal,Jhalokati,Nalchity,Nal003
Barishal,Jhalokati,Rajapur,Raj004
Barishal,Patuakhali,Pabna Patuakhali Sadar,Pab001
Barishal,Patuakhali,Bauphal,Bau002
Barishal,Patuakhali,Dashmina,Das003
Barishal,Patuakhali,Galachipa,Gal004
Barishal,Patuakhali,Kalapara,Kal005
Barishal,Patuakhali,Mirzaganj,Mir006
Barishal,Patuakhali,Dumki,Dum007
Barishal,Patuakhali,Rangabali,Ran008
Barishal,Pirojpur,Pirojpur Sadar,Pir001
Barishal,Pirojpur,Bhandaria,Bha002
Barishal,Pirojpur,Kawkhali,Kaw003
Barishal,Pirojpur,Mathbaria,Mat004
Barishal,Pirojpur,Nazirpur,Naz005
Barishal,Pirojpur,Nesarabad,Nes006
Barishal,Pirojpur,Zianagar,Zia007
Barishal,Barguna,Barguna Sadar,Bar001
Barishal,Barguna,Amtali,Amt002
Barishal,Barguna,Bamna,Bam003
Barishal,Barguna,Betagi,Bet004
Barishal,Barguna,Patharghata,Pat005
Barishal,Barguna,Taltali,Tal006
Sylhet,Sylhet,Sylhet Sadar,Syl001
Sylhet,Sylhet,Beanibazar,Bea002
Sylhet,Sylhet,Bishwanath,Bis003
Sylhet,Sylhet,Companiganj,Com004
Sylhet,Sylhet,Fenchuganj,Fen005
Sylhet,Sylhet,Golapganj,Gol006
Sylhet,Sylhet,Gowainghat,Gow007
Sylhet,Sylhet,Jaintiapur,Jai008
Sylhet,Sylhet,Kanaighat,Kan009
Sylhet,Sylhet,Zakiganj,Zak010
Sylhet,Sylhet,Dakshin Surma,Dak011
Sylhet,Sylhet,Osmaninagar,Osm012
Sylhet,Moulvibazar,Moulvibazar Sadar,Mou001
Sylhet,Moulvibazar,Barlekha,Bar002
Sylhet,Moulvibazar,Juri,Jur003
Sylhet,Moulvibazar,Kamalganj,Kam004
Sylhet,Moulvibazar,Kulaura,Kul005
Sylhet,Moulvibazar,Rajnagar,Raj006
Sylhet,Moulvibazar,Sreemangal,Sre007
Sylhet,Habiganj,Habiganj Sadar,Hab001
Sylhet,Habiganj,Bahubal,Bah002
Sylhet,Habiganj,Baniyachong,Ban003
Sylhet,Habiganj,Chunarughat,Chu004
Sylhet,Habiganj,Ajmiriganj,Ajm005
Sylhet,Habiganj,Madhabpur,Mad006
Sylhet,Habiganj,Nabiganj,Nab007
Sylhet,Habiganj,Lakhai,Lak008
Sylhet,Habiganj,Shayestaganj,Sha009
Sylhet,Sunamganj,Sunamganj Sadar,Sun001
Sylhet,Sunamganj,South Sunamganj,Sou002
Sylhet,Sunamganj,Bishwamandarpur,Bis003
Sylhet,Sunamganj,Chhatak,Chh004
Sylhet,Sunamganj,Derai,Der005
Sylhet,Sunamganj,Dharampasha,Dha006
Sylhet,Sunamganj,Dowarabazar,Dow007
Sylhet,Sunamganj,Jagannathpur,Jag008
Sylhet,Sunamganj,Jamalganj,Jam009
Sylhet,Sunamganj,Sullah,Sul010
Sylhet,Sunamganj,Tahirpur,Tah011
Sylhet,Sunamganj,Shantiganj,Sha012
Sylhet,Sunamganj,Madhyanagar,Mad013
Rangpur,Rangpur,Rangpur Sadar,Ran001
Rangpur,Rangpur,Badarganj,Bad002
Rangpur,Rangpur,Gangachara,Gan003
Rangpur,Rangpur,Kaunia,Kau004
Rangpur,Rangpur,Mithapukur,Mit005
Rangpur,Rangpur,Pirgachha,Pir006
Rangpur,Rangpur,Pirganj,Pir007
Rangpur,Rangpur,Taraganj,Tar008
Rangpur,Dinajpur,Dinajpur Sadar,Din001
Rangpur,Dinajpur,Birganj,Bir002
Rangpur,Dinajpur,Biral,Bir003
Rangpur,Dinajpur,Bochaganj,Boc004
Rangpur,Dinajpur,Kaharole,Kah005
Rangpur,Dinajpur,Khanshama,Kha006
Rangpur,Dinajpur,Biampur,Bia007
Rangpur,Dinajpur,Chirirbandar,Chi008
Rangpur,Dinajpur,Phulbari,Phu009
Rangpur,Dinajpur,Ghoraghat,Gho010
Rangpur,Dinajpur,Hakimpur,Hak011
Rangpur,Dinajpur,Nawabganj,Naw012
Rangpur,Dinajpur,Parbatipur,Par013
Rangpur,Gaibandha,Gaibandha Sadar,Gai001
Rangpur,Gaibandha,Phulchhari,Phu002
Rangpur,Gaibandha,Gobindaganj,Gob003
Rangpur,Gaibandha,Palashbari,Pal004
Rangpur,Gaibandha,Sadullapur,Sad005
Rangpur,Gaibandha,Saghata,Sag006
Rangpur,Gaibandha,Sundarganj,Sun007
Rangpur,Kurigram,Kurigram Sadar,Kur001
Rangpur,Kurigram,Nageshwari,Nag002
Rangpur,Kurigram,Bhurungamari,Bhu003
Rangpur,Kurigram,Phulbari,Phu004
Rangpur,Kurigram,Rajarhat,Raj005
Rangpur,Kurigram,Rhumari,Rhu006
Rangpur,Kurigram,Chilmari,Chi007
Rangpur,Kurigram,Ulipur,Uli008
Rangpur,Kurigram,Char Rajibpur,Cha009
Rangpur,Lalmonirhat,Lalmonirhat Sadar,Lal001
Rangpur,Lalmonirhat,Aditmari,Adi002
Rangpur,Lalmonirhat,Kaliganj,Kal003
Rangpur,Lalmonirhat,Hatibandha,Hat004
Rangpur,Lalmonirhat,Patgram,Pat005
Rangpur,Nilphamari,Nilphamari Sadar,Nil001
Rangpur,Nilphamari,Saidpur,Sai002
Rangpur,Nilphamari,Jaldhaka,Jal003
Rangpur,Nilphamari,Kishoreganj,Kis004
Rangpur,Nilphamari,Domar,Dom005
Rangpur,Nilphamari,Dimla,Dim006
Rangpur,Panchagarh,Pachagarh Sadar,Pac001
Rangpur,Panchagarh,Boda,Bod002
Rangpur,Panchagarh,Debiganj,Deb003
Rangpur,Panchagarh,Atwari,Atw004
Rangpur,Panchagarh,Tentulia,Ten005
Rangpur,Thakurgaon,Thakurgaon Sadar,Tha001
Rangpur,Thakurgaon,Baliadangi,Bal002
Rangpur,Thakurgaon,Haripur,Har003
Rangpur,Thakurgaon,Ranisankail,Ran004
Rangpur,Thakurgaon,Pirganj,Pir005
Mymensingh,Mymensingh,Mymensingh Sadar,Mym001
Mymensingh,Mymensingh,Muktagachha,Muk002
Mymensingh,Mymensingh,Fulbaria,Ful003
Mymensingh,Mymensingh,Trishal,Tri004
Mymensingh,Mymensingh,Bhaluka,Bha005
Mymensingh,Mymensingh,Gaffargaon,Gaf006
Mymensingh,Mymensingh,Nandail,Nan007
Mymensingh,Mymensingh,Ishwarganj,Ish008
Mymensingh,Mymensingh,Haluaghat,Hal009
Mymensingh,Mymensingh,Dhobaura,Dho010
Mymensingh,Mymensingh,Phulpur,Phu011
Mymensingh,Mymensingh,TaraKanda,Tar012
Mymensingh,Jamalpur,Mymensingh Jamalpur Sadar,Mym001
Mymensingh,Jamalpur,Bakshiganj,Bak002
Mymensingh,Jamalpur,Dewanganj,Dew003
Mymensingh,Jamalpur,Isampur,Isa004
Mymensingh,Jamalpur,Madarganj,Mad005
Mymensingh,Jamalpur,Melandaha,Mel006
Mymensingh,Jamalpur,Sarishabari,Sar007
Mymensingh,Netrokona,Netrokona Sadar,Net001
Mymensingh,Netrokona,Barhatta,Bar002
Mymensingh,Netrokona,Durgapur,Dur003
Mymensingh,Netrokona,Khaliajuri,Kha004
Mymensingh,Netrokona,Kalmakanda,Kal005
Mymensingh,Netrokona,Kendua,Ken006
Mymensingh,Netrokona,Madan,Mad007
Mymensingh,Netrokona,Mohanganj,Moh008
Mymensingh,Netrokona,Purbadhala,Pur009
Mymensingh,Netrokona,Atpara,Atp010
Mymensingh,Sherpur,Sherpur Sadar,She001
Mymensingh,Sherpur,Nalitabari,Nal002
Mymensingh,Sherpur,Sreebardi,Sre003
Mymensingh,Sherpur,Karhaibar,Kar004
Mymensingh,Sherpur,Jhenaigati,Jhe005`;

// Parse CSV into structured UpazilaRecord list
export const UPAZILA_DATABASE: UpazilaRecord[] = (() => {
  const lines = RAW_UPAZILA_CSV.trim().split('\n');
  const records: UpazilaRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 4) continue;

    const division = parts[0].trim();
    const district = parts[1].trim();
    const upazila = parts[2].trim();
    const defaultId = parts[3].trim();

    const divisionBn = DIVISION_BN_MAP[division] || division;
    const districtBn = DISTRICT_BN_MAP[district] || district;
    const upazilaBn = UPAZILA_BN_MAP[upazila] || upazila;

    // Default registered official email for this upazila
    const cleanUpazilaSlug = upazila.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = cleanUpazilaSlug === 'beanibazar'
      ? 'rafurbn@gmail.com'
      : `ueo.${cleanUpazilaSlug}@primary.gov.bd`;

    records.push({
      division,
      divisionBn,
      district,
      districtBn,
      upazila,
      upazilaBn,
      defaultId,
      email,
    });
  }

  return records;
})();

// Lookup helper by Default ID (case insensitive) or Upazila name
export const findUpazilaByDefaultId = (idOrName: string): UpazilaRecord | undefined => {
  if (!idOrName) return undefined;
  const clean = idOrName.trim().toLowerCase();

  // Try exact Default ID match (case insensitive)
  const byId = UPAZILA_DATABASE.find(
    (u) => u.defaultId.toLowerCase() === clean
  );
  if (byId) return byId;

  // Try Upazila English name
  const byNameEn = UPAZILA_DATABASE.find(
    (u) => u.upazila.toLowerCase() === clean
  );
  if (byNameEn) return byNameEn;

  // Try Upazila Bengali name
  const byNameBn = UPAZILA_DATABASE.find(
    (u) => u.upazilaBn === clean
  );
  if (byNameBn) return byNameBn;

  // Partial match
  return UPAZILA_DATABASE.find(
    (u) => u.upazila.toLowerCase().includes(clean) || u.upazilaBn.includes(clean)
  );
};

// Get all upazilas (all 504 entries)
export const getAllUpazilas = (): UpazilaRecord[] => UPAZILA_DATABASE;

// Get all divisions with Bengali names
export const getAllDivisions = (): { en: string; bn: string }[] => {
  const divisions = Array.from(new Set(UPAZILA_DATABASE.map((u) => u.division)));
  return divisions.map((div) => ({
    en: div,
    bn: DIVISION_BN_MAP[div] || div,
  }));
};

// Get districts for a given division (or all if omitted)
export const getDistrictsByDivision = (
  divisionEn?: string
): { en: string; bn: string }[] => {
  const filtered = divisionEn && divisionEn !== 'ALL'
    ? UPAZILA_DATABASE.filter((u) => u.division.toLowerCase() === divisionEn.toLowerCase())
    : UPAZILA_DATABASE;
  const districts = Array.from(new Set(filtered.map((u) => u.district)));
  return districts.map((dist) => ({
    en: dist,
    bn: DISTRICT_BN_MAP[dist] || dist,
  }));
};

// Advanced filter by division, district, and search query
export const filterUpazilas = (options: {
  division?: string;
  district?: string;
  query?: string;
}): UpazilaRecord[] => {
  const { division, district, query } = options;
  const q = (query || '').toLowerCase().trim();

  return UPAZILA_DATABASE.filter((u) => {
    if (division && division !== 'ALL' && u.division.toLowerCase() !== division.toLowerCase()) {
      return false;
    }
    if (district && district !== 'ALL' && u.district.toLowerCase() !== district.toLowerCase()) {
      return false;
    }
    if (!q) return true;
    return (
      u.defaultId.toLowerCase().includes(q) ||
      u.upazila.toLowerCase().includes(q) ||
      u.upazilaBn.includes(q) ||
      u.district.toLowerCase().includes(q) ||
      u.districtBn.includes(q) ||
      u.division.toLowerCase().includes(q) ||
      u.divisionBn.includes(q)
    );
  });
};

// Search upazilas by query - Returns ALL 504 upazilas when query is empty!
export const searchUpazilas = (query: string): UpazilaRecord[] => {
  if (!query || !query.trim()) return UPAZILA_DATABASE;
  const q = query.toLowerCase().trim();
  return UPAZILA_DATABASE.filter(
    (u) =>
      u.defaultId.toLowerCase().includes(q) ||
      u.upazila.toLowerCase().includes(q) ||
      u.upazilaBn.includes(q) ||
      u.district.toLowerCase().includes(q) ||
      u.districtBn.includes(q) ||
      u.division.toLowerCase().includes(q) ||
      u.divisionBn.includes(q)
  );
};

