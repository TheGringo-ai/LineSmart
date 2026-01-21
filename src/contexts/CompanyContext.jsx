import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const { userProfile, currentUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = userProfile?.companyId;

  // Fetch company data
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const companyRef = doc(db, 'companies', companyId);

    const unsubscribe = onSnapshot(companyRef, (doc) => {
      if (doc.exists()) {
        setCompany({ id: doc.id, ...doc.data() });
      } else {
        setCompany(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching company:', err);
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [companyId]);

  // Fetch employees
  useEffect(() => {
    if (!companyId) return;

    const employeesRef = collection(db, 'companies', companyId, 'employees');
    const q = query(employeesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeList);
    }, (err) => {
      console.error('Error fetching employees:', err);
      setError(err.message);
    });

    return unsubscribe;
  }, [companyId]);

  // Fetch trainings
  useEffect(() => {
    if (!companyId) return;

    const trainingsRef = collection(db, 'companies', companyId, 'trainings');
    const q = query(trainingsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trainingList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrainings(trainingList);
    }, (err) => {
      console.error('Error fetching trainings:', err);
      setError(err.message);
    });

    return unsubscribe;
  }, [companyId]);

  // Create or update company
  const saveCompany = useCallback(async (companyData) => {
    try {
      setError(null);
      const id = companyId || currentUser?.uid;
      if (!id) throw new Error('No company ID available');

      const companyRef = doc(db, 'companies', id);
      const docSnap = await getDoc(companyRef);

      if (docSnap.exists()) {
        await updateDoc(companyRef, {
          ...companyData,
          updated_at: serverTimestamp()
        });
      } else {
        await setDoc(companyRef, {
          ...companyData,
          ownerId: currentUser?.uid,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }

      return id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [companyId, currentUser]);

  // Add employee
  const addEmployee = useCallback(async (employeeData) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');

      const employeesRef = collection(db, 'companies', companyId, 'employees');
      const newEmployeeRef = doc(employeesRef);

      await setDoc(newEmployeeRef, {
        ...employeeData,
        completedTrainings: 0,
        totalTrainings: 0,
        performance: 0,
        certifications: [],
        trainingHistory: [],
        recommendedTrainings: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return newEmployeeRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [companyId]);

  // Update employee
  const updateEmployee = useCallback(async (employeeId, data) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');

      const employeeRef = doc(db, 'companies', companyId, 'employees', employeeId);
      await updateDoc(employeeRef, {
        ...data,
        updated_at: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [companyId]);

  // Save training
  const saveTraining = useCallback(async (trainingData) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');

      const trainingsRef = collection(db, 'companies', companyId, 'trainings');
      const newTrainingRef = doc(trainingsRef);

      await setDoc(newTrainingRef, {
        ...trainingData,
        createdBy: currentUser?.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return newTrainingRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [companyId, currentUser]);

  // Save quiz result
  const saveQuizResult = useCallback(async (resultData) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');

      const resultsRef = collection(db, 'companies', companyId, 'quizResults');
      const newResultRef = doc(resultsRef);

      await setDoc(newResultRef, {
        ...resultData,
        completedAt: serverTimestamp()
      });

      // Update employee training stats if passed
      if (resultData.passed && resultData.employeeId) {
        const employeeRef = doc(db, 'companies', companyId, 'employees', resultData.employeeId);
        const employeeSnap = await getDoc(employeeRef);

        if (employeeSnap.exists()) {
          const employeeData = employeeSnap.data();
          await updateDoc(employeeRef, {
            completedTrainings: (employeeData.completedTrainings || 0) + 1,
            trainingHistory: [
              ...(employeeData.trainingHistory || []),
              {
                trainingId: resultData.trainingId,
                title: resultData.trainingTitle,
                score: resultData.percentage,
                completedAt: new Date().toISOString()
              }
            ],
            updated_at: serverTimestamp()
          });
        }
      }

      return newResultRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [companyId]);

  const value = {
    company,
    employees,
    trainings,
    loading,
    error,
    saveCompany,
    addEmployee,
    updateEmployee,
    saveTraining,
    saveQuizResult
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
