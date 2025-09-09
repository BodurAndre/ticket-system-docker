package org.example.server.service;

import org.example.server.models.PhoneNumber;
import org.example.server.repositories.PhoneNumberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PhoneNumberService {

    private final PhoneNumberRepository phoneNumberRepository;

    @Autowired
    public PhoneNumberService(PhoneNumberRepository phoneNumberRepository){this.phoneNumberRepository = phoneNumberRepository;}

    public PhoneNumber savePhoneNumber(PhoneNumber phoneNumber){return phoneNumberRepository.save(phoneNumber);}
    
    public List<PhoneNumber> getPhoneNumbersByCompanyId(Long companyId) {
        return phoneNumberRepository.findByCompanyId(companyId);
    }
}
